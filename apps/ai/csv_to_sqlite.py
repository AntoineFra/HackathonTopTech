from io import BytesIO
import os
import re
import csv
import time
import sqlite3
import requests
from typing import List, Dict, Any, Optional
from concurrent.futures import ThreadPoolExecutor, as_completed
import unicodedata
import pandas as pd

csv_names = [
    "cc_act",
    "cc_emp",
    "cc_fam",
    "cc_for",
    "cc_log",
    "cc_pop",
    "td_img1A",
    "td_img1B",
    "td_img2A_v2",
    "td_img2B",
    "td_img3A",
    "td_img3B",
    "td_nat1",
    "td_nat2",
    "td_nat3A",
    "td_nat3B",
]


def strip_accents(text):
    """Supprime tous les accents et caractères spéciaux Unicode."""
    if not isinstance(text, str):
        return text
    text = unicodedata.normalize("NFKD", text)
    return "".join(c for c in text if not unicodedata.combining(c))


def safe_sql_name(s):
    s = strip_accents(s)
    s = re.sub(r"[^0-9A-Za-z_]", "_", s)
    s = re.sub(r"_+", "_", s).strip("_")
    if not s:
        s = "COL"
    if s[0].isdigit():
        s = "_" + s
    return s.upper()


def open_csv(csv_path: str) -> List[Dict[str, Any]]:
    """Parse an INSEE 'tableaux' CSV into separate section objects.

    Rules (based on dataset samples):
    - The first 5 lines are general titles/credits and can be skipped.
    - Each section starts with a quoted line like: "ACT T1 - <Title>" (or EMP/FAM/FOR/LOG/POP/IMG1A/...)
    - Then a header line (semicolon-delimited), then one or more data lines.
    - A section is terminated by a blank line or a line starting with "Source :" / "Sources :" (possibly after a "Champ :" note).

    Returns a list of dicts, one per section:
      {
        'code': 'ACT',              # CSV family code
        'section': 'T1',            # section identifier (e.g., T1, G1)
        'title': 'Population ...',  # human title after the hyphen
        'header': [str, ...],       # parsed header cells
        'rows': [[str, ...], ...],  # parsed data rows
        'source': str,              # optional source text
        'notes': str,               # optional 'Champ :' note
      }
    """
    if not os.path.exists(csv_path):
        raise FileNotFoundError(f"CSV not found: {csv_path}")

    with open(csv_path, "r", encoding="utf-8", errors="ignore") as fh:
        lines = [ln.rstrip("\n\r") for ln in fh.readlines()]

    # Skip the first 5 lines (titles/credits)
    if len(lines) >= 5:
        lines = lines[5:]

    # Helper to parse a single semicolon CSV line with quotes
    def parse_semicolon_line(line: str) -> List[str]:
        reader = csv.reader([line], delimiter=";", quotechar='"')
        return next(reader)

    section_re = re.compile(r'^"\s*([A-Z0-9]{3,5})\s+([A-Za-z0-9]+)\s*-\s*(.*?)"\s*$')
    sections: List[Dict[str, Any]] = []

    i = 0
    while i < len(lines):
        cur = lines[i].strip()
        if not cur:
            i += 1
            continue

        m = section_re.match(cur)
        if not m:
            i += 1
            continue

        code, sec_id, title = m.group(1), m.group(2), m.group(3)

        # Header line expected next
        header_line = lines[i + 1] if i + 1 < len(lines) else ""
        header = parse_semicolon_line(header_line) if header_line else []

        # Collect data lines until blank or Source/Sources/Champ lines
        data_rows: List[List[str]] = []
        notes = ""
        source = ""

        j = i + 2
        while j < len(lines):
            raw = lines[j]
            s = raw.strip()
            if not s:
                j += 1
                break  # blank line ends the data block
            low = s.lower().strip('" ')
            if low.startswith("source :") or low.startswith("sources :"):
                # capture source, stop section
                source = re.sub(r"^(?i)sources?\s*:\s*", "", s.strip('" '))
                j += 1
                break
            if low.startswith("champ :"):
                # capture note and continue; a following Source may appear
                notes = re.sub(r"^(?i)champ\s*:\s*", "", s.strip('" '))
                j += 1
                # look ahead optional blank then source
                while j < len(lines) and not lines[j].strip():
                    j += 1
                if j < len(lines):
                    s2 = lines[j].strip()
                    low2 = s2.lower().strip('" ')
                    if low2.startswith("source :") or low2.startswith("sources :"):
                        source = re.sub(r"^(?i)sources?\s*:\s*", "", s2.strip('" '))
                        j += 1
                break

            # normal data row
            data_rows.append(parse_semicolon_line(raw))
            j += 1

        sections.append(
            {
                "code": code,
                "section": sec_id,
                "title": title,
                "header": header,
                "rows": data_rows,
                "source": source,
                "notes": notes,
            }
        )

        i = j

    return sections


def print_parsed_csv(sections: List[Dict[str, Any]], max_rows: int = 5) -> None:
    """Pretty-print the result of parse_csv for quick inspection.

    - Shows code, section id, title, optional notes and source.
    - Prints header and up to max_rows data rows per section.
    """
    if not sections:
        print(f"No sections found.")
        return

    print(f"Sections: {len(sections)}\n")
    for idx, sec in enumerate(sections, 1):
        code = sec.get("code", "")
        sec_id = sec.get("section", "")
        title = sec.get("title", "")
        notes = sec.get("notes", "")
        source = sec.get("source", "")
        header = sec.get("header", [])
        rows = sec.get("rows", [])

        print(f"[{idx}] {code} {sec_id} - {title}")
        if notes:
            print(f"  Champ: {notes}")
        if source:
            print(f"  Source: {source}")

        # Header
        if header:
            print("  Header:")
            print("    " + " | ".join(header))
        else:
            print("  (no header)")

        # Rows (limited)
        if rows:
            print(f"  Rows (showing up to {max_rows}):")
            for r in rows[:max_rows]:
                print("    " + " | ".join(r))
            if len(rows) > max_rows:
                print(f"    ... ({len(rows) - max_rows} more rows)")
        else:
            print("  (no rows)")

        print("")


def csv_to_sqlite(
    city_code: str,
    out_root: str = os.path.join("data", "csv"),
    timeout: int = 30,
    retries: int = 2,
    pause: float = 0.0,
    max_workers: int = 6,
):
    city_code = str(city_code).strip()
    city_dir = os.path.join(out_root, city_code)
    os.makedirs(city_dir, exist_ok=True)

    db_path = os.path.join(city_dir, f"{city_code}.db")
    conn = sqlite3.connect(db_path)
    cur = conn.cursor()

    # Load canonical schema if available (non-fatal if missing)
    root_dir = os.path.dirname(__file__) or "."
    schema_path = os.path.join(root_dir, "data", "dumps", "schema.sql")
    if os.path.exists(schema_path):
        with open(schema_path, "r", encoding="utf-8", errors="ignore") as f:
            schema_sql = f.read()
        try:
            cur.executescript(schema_sql)
            conn.commit()
        except Exception as e:
            print(f"Warning: could not apply schema.sql: {e}")

    def to_int(x: str):
        if x is None:
            return None
        s = str(x).strip().replace("\u00a0", " ").replace(" ", "")
        if s == "" or s == "NA":
            return None
        try:
            return int(s)
        except Exception:
            # Sometimes values are like '0,0' but intended int -> fall back to float->int
            try:
                return int(float(s.replace(",", ".")))
            except Exception:
                return None

    def to_float(x: str):
        if x is None:
            return None
        s = str(x).strip().replace("\u00a0", " ")
        if s == "" or s == "NA":
            return None
        s = s.replace("%", "").replace(" ", "").replace(",", ".")
        try:
            return float(s)
        except Exception:
            return None

    def nz_int(x: str, default: int = 0) -> int:
        """Convert to int; if conversion fails (None/NA/empty), return default."""
        v = to_int(x)
        return v if v is not None else default

    def nz_float(x: str, default: float = 0.0) -> float:
        """Convert to float; if conversion fails (None/NA/empty), return default."""
        v = to_float(x)
        return v if v is not None else default

    def norm_label(x: str) -> str:
        if x is None:
            return ""
        s = str(x).strip().strip('"')
        # Normalize common unicode variants to ASCII before stripping accents
        # - quotes: ’ ‘ ʻ ′ ʼ → '
        # - double quotes: “ ” → "
        # - dashes/minus: – — − → -
        # - non-breaking space → normal space
        trans_table = {
            ord("\u2019"): "'",  # right single quotation mark
            ord("\u2018"): "'",  # left single quotation mark
            ord("\u02bc"): "'",  # modifier letter apostrophe
            ord("\u2032"): "'",  # prime
            ord("\u02bb"): "'",  # modifier letter turned comma (ʻ)
            ord("\u201b"): "'",  # single high-reversed-9 quotation mark
            ord("\u201c"): '"',  # left double quotation mark
            ord("\u201d"): '"',  # right double quotation mark
            ord("\u2013"): "-",  # en dash
            ord("\u2014"): "-",  # em dash
            ord("\u2212"): "-",  # minus sign
            ord("\u00a0"): " ",  # non-breaking space
        }
        s = s.translate(trans_table)
        s = strip_accents(s)
        # collapse and trim spaces
        s = re.sub(r"\s+", " ", s).strip()
        return s

    def age_to_bucket(x: str) -> str:
        x = norm_label(x)
        if x.lower().startswith("ensemble"):
            return "Ensemble"
        # e.g., '15 a 24 ans' or '55 a 64 ans'
        m = re.findall(r"(\d+)", x)
        if len(m) >= 2:
            return f"{m[0]}-{m[1]}"
        return x

    # Mappers for ACT sections -> canonical schema tables
    def insert_act_t1(section: Dict[str, Any]):
        table = "act_t1_employment_status_2022"
        header = section["header"]
        rows = section["rows"]
        data = []
        for r in rows:
            if not r:
                continue
            status = norm_label(r[0])  # 'Ensemble', 'Salaries', 'Non-salaries'
            data.append(
                (
                    status,
                    nz_int(r[1]) if len(r) > 1 else 0,
                    nz_float(r[2]) if len(r) > 2 else 0.0,
                    nz_float(r[3]) if len(r) > 3 else 0.0,
                    nz_float(r[4]) if len(r) > 4 else 0.0,
                )
            )

    def insert_act_t2(section: Dict[str, Any]):
        table = "act_t2_employment_condition_by_sex_2022"
        rows = section["rows"]
        data = []
        for r in rows:
            if not r:
                continue
            data.append(
                (
                    norm_label(r[0]),
                    nz_int(r[1]) if len(r) > 1 else 0,
                    nz_float(r[2]) if len(r) > 2 else 0.0,
                    nz_int(r[3]) if len(r) > 3 else 0,
                    nz_float(r[4]) if len(r) > 4 else 0.0,
                )
            )
        cur.executemany(
            f"INSERT INTO {table} (employment_condition, men_count, men_percent, women_count, women_percent) VALUES (?,?,?,?,?)",
            data,
        )

    def insert_act_t3(section: Dict[str, Any]):
        table = "act_t3_salaries_by_age_and_sex_2022"
        rows = section["rows"]
        data = []
        for r in rows:
            if not r:
                continue
            data.append(
                (
                    age_to_bucket(r[0]),
                    nz_int(r[1]) if len(r) > 1 else 0,
                    nz_float(r[2]) if len(r) > 2 else 0.0,
                    nz_int(r[3]) if len(r) > 3 else 0,
                    nz_float(r[4]) if len(r) > 4 else 0.0,
                )
            )
        cur.executemany(
            f"INSERT INTO {table} (age_group, men_count, men_part_time_percent, women_count, women_part_time_percent) VALUES (?,?,?,?,?)",
            data,
        )

    def insert_act_g1(section: Dict[str, Any]):
        table = "act_g1_part_time_share_by_sex"
        rows = section["rows"]
        data = []
        for r in rows:
            if not r:
                continue
            data.append(
                (
                    norm_label(r[0]),
                    nz_float(r[1]) if len(r) > 1 else 0.0,
                    nz_float(r[2]) if len(r) > 2 else 0.0,
                    nz_float(r[3]) if len(r) > 3 else 0.0,
                )
            )
        cur.executemany(
            f"INSERT INTO {table} (sex, percent_2011, percent_2016, percent_2022) VALUES (?,?,?,?)",
            data,
        )

    def insert_act_t4(section: Dict[str, Any]):
        table = "act_t4_work_location_2022"
        rows = section["rows"]
        data = []
        for r in rows:
            if not r:
                continue
            data.append(
                (
                    norm_label(r[0]),
                    nz_int(r[1]) if len(r) > 1 else 0,
                    nz_float(r[2]) if len(r) > 2 else 0.0,
                    nz_int(r[3]) if len(r) > 3 else 0,
                    nz_float(r[4]) if len(r) > 4 else 0.0,
                    nz_int(r[5]) if len(r) > 5 else 0,
                    nz_float(r[6]) if len(r) > 6 else 0.0,
                )
            )
        cur.executemany(
            f"INSERT INTO {table} (work_location, count_2011, percent_2011, count_2016, percent_2016, count_2022, percent_2022) VALUES (?,?,?,?,?,?,?)",
            data,
        )

    def insert_act_g2(section: Dict[str, Any]):
        table = "act_g2_transport_mode_share_2022"
        rows = section["rows"]
        data = []
        for r in rows:
            if not r:
                continue
            data.append(
                (
                    norm_label(r[0]),
                    nz_float(r[1]) if len(r) > 1 else 0.0,
                )
            )
        cur.executemany(
            f"INSERT INTO {table} (transport_mode, percent_2022) VALUES (?,?)",
            data,
        )

    def dispatch_section(section: Dict[str, Any]):
        code = section.get("code", "").upper()
        sec = section.get("section", "").upper()
        if code == "ACT":
            if sec == "T1":
                insert_act_t1(section)
            elif sec == "T2":
                insert_act_t2(section)
            elif sec == "T3":
                insert_act_t3(section)
            elif sec == "T4":
                insert_act_t4(section)
            elif sec == "G1":
                insert_act_g1(section)
            elif sec == "G2":
                insert_act_g2(section)
            else:
                # Unknown ACT section id -> skip
                return
        elif code == "EMP":
            # EMP tables: schema uses de-accented ASCII checks -> use norm_label
            def insert_emp_t1(secobj):
                table = "emp_t1_population_15_64_by_activity_type"
                rows = secobj["rows"]
                data = []
                for r in rows:
                    if not r:
                        continue
                    data.append(
                        (
                            norm_label(r[0]),
                            to_float(r[1]) if len(r) > 1 else None,
                            to_float(r[2]) if len(r) > 2 else None,
                            to_float(r[3]) if len(r) > 3 else None,
                        )
                    )
                cur.executemany(
                    f"INSERT INTO {table} (type_activite, annee_2011, annee_2016, annee_2022) VALUES (?,?,?,?)",
                    data,
                )

            def insert_emp_t2(secobj):
                table = "emp_t2_activity_and_employment_by_sex_age_2022"
                rows = secobj["rows"]
                block = None  # None | 'Hommes' | 'Femmes'
                data = []
                for r in rows:
                    if not r:
                        continue
                    label = norm_label(r[0])
                    if label in ("Ensemble", "Hommes", "Femmes"):
                        block = label if label in ("Hommes", "Femmes") else None
                        # top-level rows are kept as-is
                        cat = label
                    else:
                        # sub-rows under a sex block
                        cat = f"{block} {label}" if block else label
                    data.append(
                        (
                            cat,
                            to_int(r[1]) if len(r) > 1 else None,
                            to_int(r[2]) if len(r) > 2 else None,
                            to_float(r[3]) if len(r) > 3 else None,
                            to_int(r[4]) if len(r) > 4 else None,
                            to_float(r[5]) if len(r) > 5 else None,
                        )
                    )
                cur.executemany(
                    f"INSERT INTO {table} (categorie, population, actifs, taux_activite, actifs_emploi, taux_emploi) VALUES (?,?,?,?,?,?)",
                    data,
                )

            def insert_emp_g1(secobj):
                table = "emp_g1_population_15_64_by_activity_type_2022"
                rows = secobj["rows"]
                data = []
                for r in rows:
                    if not r:
                        continue
                    data.append(
                        (norm_label(r[0]), to_float(r[1]) if len(r) > 1 else None)
                    )
                cur.executemany(
                    f"INSERT INTO {table} (categorie, population_pourcent) VALUES (?,?)",
                    data,
                )

            def insert_emp_t3(secobj):
                table = "emp_t3_active_population_by_socio_professional_group"
                rows = secobj["rows"]
                data = []
                for r in rows:
                    if not r:
                        continue
                    label = norm_label(r[0])
                    # remove leading "dont " if present
                    label = re.sub(r"^dont\s+", "", label, flags=re.IGNORECASE)
                    # canonicalize to schema values (case-sensitive match required in CHECK)
                    key = label.lower()
                    canon_map = {
                        "ensemble": "Ensemble",
                        "agriculteurs exploitants": "Agriculteurs exploitants",
                        "artisans, commercants, chefs d'entreprise": "Artisans, commercants, chefs d'entreprise",
                        "cadres et professions intellectuelles superieures": "Cadres et professions intellectuelles superieures",
                        "professions intermediaires": "Professions intermediaires",
                        "employes": "Employes",
                        "ouvriers": "Ouvriers",
                    }
                    label = canon_map.get(key, label)
                    data.append(
                        (
                            label,
                            to_int(r[1]) if len(r) > 1 else None,
                            to_int(r[2]) if len(r) > 2 else None,
                            to_int(r[3]) if len(r) > 3 else None,
                            to_int(r[4]) if len(r) > 4 else None,
                            to_int(r[5]) if len(r) > 5 else None,
                            to_int(r[6]) if len(r) > 6 else None,
                        )
                    )
                cur.executemany(
                    f"INSERT INTO {table} (groupe_socio, annee_2011, emploi_2011, annee_2016, emploi_2016, annee_2022, emploi_2022) VALUES (?,?,?,?,?,?,?)",
                    data,
                )

            def insert_emp_t4(secobj):
                table = "emp_t4_unemployment_census_15_64"
                rows = secobj["rows"]
                data = []
                for r in rows:
                    if not r:
                        continue
                    data.append(
                        (
                            norm_label(r[0]),
                            to_float(r[1]) if len(r) > 1 else None,
                            to_float(r[2]) if len(r) > 2 else None,
                            to_float(r[3]) if len(r) > 3 else None,
                        )
                    )
                cur.executemany(
                    f"INSERT INTO {table} (indicateur, annee_2011, annee_2016, annee_2022) VALUES (?,?,?,?)",
                    data,
                )

            def insert_emp_g2(secobj):
                table = "emp_g2_unemployment_rate_by_diploma_2022"
                rows = secobj["rows"]
                data = []
                for r in rows:
                    if not r:
                        continue
                    data.append(
                        (norm_label(r[0]), to_float(r[1]) if len(r) > 1 else None)
                    )
                cur.executemany(
                    f"INSERT INTO {table} (diplome, taux_chomage) VALUES (?,?)",
                    data,
                )

            def insert_emp_t5(secobj):
                table = "emp_t5_employment_and_activity"
                rows = secobj["rows"]
                data = []
                for r in rows:
                    if not r:
                        continue
                    data.append(
                        (
                            norm_label(r[0]),
                            to_float(r[1]) if len(r) > 1 else None,
                            to_float(r[2]) if len(r) > 2 else None,
                            to_float(r[3]) if len(r) > 3 else None,
                        )
                    )
                cur.executemany(
                    f"INSERT INTO {table} (indicateur, annee_2011, annee_2016, annee_2022) VALUES (?,?,?,?)",
                    data,
                )

            def insert_emp_t6(secobj):
                table = "emp_t6_jobs_by_professional_status"
                rows = secobj["rows"]
                data = []
                for r in rows:
                    if not r:
                        continue
                    data.append(
                        (
                            norm_label(r[0]),
                            to_int(r[1]) if len(r) > 1 else None,
                            to_float(r[2]) if len(r) > 2 else None,
                            to_int(r[3]) if len(r) > 3 else None,
                            to_float(r[4]) if len(r) > 4 else None,
                            to_int(r[5]) if len(r) > 5 else None,
                            to_float(r[6]) if len(r) > 6 else None,
                        )
                    )
                cur.executemany(
                    f"INSERT INTO {table} (statut_professionnel, nb_2011, pct_2011, nb_2016, pct_2016, nb_2022, pct_2022) VALUES (?,?,?,?,?,?,?)",
                    data,
                )

            def insert_emp_t7(secobj):
                table = "emp_t7_jobs_by_socio_professional_group_2022"
                rows = secobj["rows"]
                data = []
                for r in rows:
                    if not r:
                        continue
                    data.append(
                        (
                            norm_label(r[0]),
                            to_int(r[1]) if len(r) > 1 else None,
                            to_float(r[2]) if len(r) > 2 else None,
                        )
                    )
                cur.executemany(
                    f"INSERT INTO {table} (groupe_socio, nombre, pourcentage) VALUES (?,?,?)",
                    data,
                )

            def insert_emp_g3(secobj):
                table = "emp_g3_jobs_by_socio_professional_group"
                rows = secobj["rows"]
                data = []
                for r in rows:
                    if not r:
                        continue
                    data.append(
                        (
                            norm_label(r[0]),
                            to_float(r[1]) if len(r) > 1 else None,
                            to_float(r[2]) if len(r) > 2 else None,
                            to_float(r[3]) if len(r) > 3 else None,
                        )
                    )
                cur.executemany(
                    f"INSERT INTO {table} (groupe_socio, annee_2011, annee_2016, annee_2022) VALUES (?,?,?,?)",
                    data,
                )

            def insert_emp_t8(secobj):
                table = "emp_t8_jobs_by_activity_sector"
                rows = secobj["rows"]
                data = []
                for r in rows:
                    if not r:
                        continue
                    # Skip header continuation row starting with 'Nombre'
                    if norm_label(r[0]).lower() == "nombre":
                        continue
                    data.append(
                        (
                            norm_label(r[0]),
                            to_int(r[1]) if len(r) > 1 else None,
                            to_float(r[2]) if len(r) > 2 else None,
                            to_int(r[3]) if len(r) > 3 else None,
                            to_float(r[4]) if len(r) > 4 else None,
                            to_int(r[5]) if len(r) > 5 else None,
                            to_float(r[6]) if len(r) > 6 else None,
                            to_float(r[7]) if len(r) > 7 else None,
                            to_float(r[8]) if len(r) > 8 else None,
                        )
                    )
                cur.executemany(
                    f"INSERT INTO {table} (secteur_activite, nb_2011, pct_2011, nb_2016, pct_2016, nb_2022, pct_2022, femmes_pct, salaries_pct) VALUES (?,?,?,?,?,?,?,?,?)",
                    data,
                )

            def insert_emp_g4(secobj):
                table = "emp_g4_feminization_rate_by_status_and_sector_2022"
                rows = secobj["rows"]
                data = []
                for r in rows:
                    if not r:
                        continue
                    data.append(
                        (
                            norm_label(r[0]),
                            to_float(r[1]) if len(r) > 1 else None,
                            to_float(r[2]) if len(r) > 2 else None,
                        )
                    )
                cur.executemany(
                    f"INSERT INTO {table} (secteur, salaries_pct, non_salaries_pct) VALUES (?,?,?)",
                    data,
                )

            if sec == "T1":
                insert_emp_t1(section)
            elif sec == "T2":
                insert_emp_t2(section)
            elif sec == "G1":
                insert_emp_g1(section)
            elif sec == "T3":
                insert_emp_t3(section)
            elif sec == "T4":
                insert_emp_t4(section)
            elif sec == "G2":
                insert_emp_g2(section)
            elif sec == "T5":
                insert_emp_t5(section)
            elif sec == "T6":
                insert_emp_t6(section)
            elif sec == "T7":
                insert_emp_t7(section)
            elif sec == "G3":
                insert_emp_g3(section)
            elif sec == "T8":
                insert_emp_t8(section)
            elif sec == "G4":
                insert_emp_g4(section)
            else:
                return
        elif code == "FAM":
            # FAM checks mostly ASCII -> use norm_label
            def insert_fam_t1(secobj):
                table = "fam_t1_households_by_composition"
                rows = secobj["rows"]
                data = []
                for r in rows:
                    if not r:
                        continue
                    label = norm_label(r[0])
                    allowed = {
                        "Ensemble",
                        "Menages d'une personne",
                        "Hommes seuls",
                        "Femmes seules",
                        "Autres menages sans famille",
                        "Menages avec famille(s) dont la famille principale est :",
                        "Un couple sans enfant",
                        "Un couple avec enfant(s)",
                        "Une famille monoparentale",
                    }
                    if label not in allowed:
                        continue
                    data.append(
                        (
                            label,
                            to_int(r[1]) if len(r) > 1 else None,
                            to_float(r[2]) if len(r) > 2 else None,
                            to_int(r[3]) if len(r) > 3 else None,
                            to_float(r[4]) if len(r) > 4 else None,
                            to_int(r[5]) if len(r) > 5 else None,
                            to_float(r[6]) if len(r) > 6 else None,
                            to_int(r[7]) if len(r) > 7 else None,
                            to_int(r[8]) if len(r) > 8 else None,
                            to_int(r[9]) if len(r) > 9 else None,
                        )
                    )
                cur.executemany(
                    f"INSERT INTO {table} (household_type, year_2011_count, year_2011_percent, year_2016_count, year_2016_percent, year_2022_count, year_2022_percent, population_2011, population_2016, population_2022) VALUES (?,?,?,?,?,?,?,?,?,?)",
                    data,
                )

            def insert_fam_g1(secobj):
                table = "fam_g1_household_size_evolution"
                rows = secobj["rows"]
                data = []
                for r in rows:
                    if not r:
                        continue
                    data.append(
                        (
                            norm_label(r[0]),
                            to_float(r[1]) if len(r) > 1 else None,
                            to_float(r[2]) if len(r) > 2 else None,
                            to_float(r[3]) if len(r) > 3 else None,
                            to_float(r[4]) if len(r) > 4 else None,
                            to_float(r[5]) if len(r) > 5 else None,
                            to_float(r[6]) if len(r) > 6 else None,
                            to_float(r[7]) if len(r) > 7 else None,
                            to_float(r[8]) if len(r) > 8 else None,
                            to_float(r[9]) if len(r) > 9 else None,
                        )
                    )
                cur.executemany(
                    f"INSERT INTO {table} (indicator, year_1968, year_1975, year_1982, year_1990, year_1999, year_2006, year_2011, year_2016, year_2022) VALUES (?,?,?,?,?,?,?,?,?,?)",
                    data,
                )

            def insert_fam_g2(secobj):
                table = "fam_g2_people_living_alone_by_age"
                rows = secobj["rows"]
                data = [
                    (
                        age_to_bucket(r[0]),
                        to_float(r[1]) if len(r) > 1 else None,
                        to_float(r[2]) if len(r) > 2 else None,
                        to_float(r[3]) if len(r) > 3 else None,
                    )
                    for r in rows
                    if r
                ]
                cur.executemany(
                    f"INSERT INTO {table} (age_category, year_2011_percent, year_2016_percent, year_2022_percent) VALUES (?,?,?,?)",
                    data,
                )

            def insert_fam_g3(secobj):
                table = "fam_g3_people_in_couple_by_age"
                rows = secobj["rows"]
                data = [
                    (
                        age_to_bucket(r[0]),
                        to_float(r[1]) if len(r) > 1 else None,
                        to_float(r[2]) if len(r) > 2 else None,
                        to_float(r[3]) if len(r) > 3 else None,
                    )
                    for r in rows
                    if r
                ]
                cur.executemany(
                    f"INSERT INTO {table} (age_category, year_2011_percent, year_2016_percent, year_2022_percent) VALUES (?,?,?,?)",
                    data,
                )

            def insert_fam_g4(secobj):
                table = "fam_g4_marital_status_2022"
                rows = secobj["rows"]
                data = [
                    (norm_label(r[0]), to_float(r[1]) if len(r) > 1 else None)
                    for r in rows
                    if r
                ]
                cur.executemany(
                    f"INSERT INTO {table} (marital_status, percent) VALUES (?,?)",
                    data,
                )

            def insert_fam_t2(secobj):
                table = "fam_t2_households_by_professional_group_2022"
                rows = secobj["rows"]
                data = []
                for r in rows:
                    if not r:
                        continue
                    label = norm_label(r[0])
                    # keep 'dont ' prefix to match schema enumerations
                    allowed = {
                        "Ensemble",
                        "dont agriculteurs exploitants",
                        "dont artisans, commercants, chefs d'entreprise",
                        "dont cadres et professions intellectuelles superieures",
                        "dont professions intermediaires",
                        "dont employes",
                        "dont ouvriers",
                    }
                    if label not in allowed:
                        continue
                    data.append(
                        (
                            label,
                            to_int(r[1]) if len(r) > 1 else None,
                            to_float(r[2]) if len(r) > 2 else None,
                            to_int(r[3]) if len(r) > 3 else None,
                            to_float(r[4]) if len(r) > 4 else None,
                        )
                    )
                cur.executemany(
                    f"INSERT INTO {table} (group_name, household_count, household_percent, population_count, population_percent) VALUES (?,?,?,?,?)",
                    data,
                )

            def insert_fam_g5(secobj):
                table = "fam_g5_household_distribution_by_professional_group_2022"
                rows = secobj["rows"]
                data = [
                    (norm_label(r[0]), to_float(r[1]) if len(r) > 1 else None)
                    for r in rows
                    if r
                ]
                cur.executemany(
                    f"INSERT INTO {table} (group_name, percent) VALUES (?,?)",
                    data,
                )

            def insert_fam_t3(secobj):
                table = "fam_t3_family_composition"
                rows = secobj["rows"]
                data = []
                for r in rows:
                    if not r:
                        continue
                    data.append(
                        (
                            norm_label(r[0]),
                            to_int(r[1]) if len(r) > 1 else None,
                            to_float(r[2]) if len(r) > 2 else None,
                            to_int(r[3]) if len(r) > 3 else None,
                            to_float(r[4]) if len(r) > 4 else None,
                            to_int(r[5]) if len(r) > 5 else None,
                            to_float(r[6]) if len(r) > 6 else None,
                        )
                    )
                cur.executemany(
                    f"INSERT INTO {table} (family_type, year_2011_count, year_2011_percent, year_2016_count, year_2016_percent, year_2022_count, year_2022_percent) VALUES (?,?,?,?,?,?,?)",
                    data,
                )

            def insert_fam_t3bis(secobj):
                table = "fam_t3bis_couples_with_children_families"
                rows = secobj["rows"]
                data = [
                    (
                        norm_label(r[0]),
                        to_int(r[1]) if len(r) > 1 else None,
                        to_float(r[2]) if len(r) > 2 else None,
                    )
                    for r in rows
                    if r
                ]
                cur.executemany(
                    f"INSERT INTO {table} (family_type, count_2022, percent_2022) VALUES (?,?,?)",
                    data,
                )

            def insert_fam_t4(secobj):
                table = "fam_t4_families_by_number_of_children"
                rows = secobj["rows"]
                data = []
                for r in rows:
                    if not r:
                        continue
                    data.append(
                        (
                            norm_label(r[0]),
                            to_int(r[1]) if len(r) > 1 else None,
                            to_float(r[2]) if len(r) > 2 else None,
                            to_int(r[3]) if len(r) > 3 else None,
                            to_float(r[4]) if len(r) > 4 else None,
                            to_int(r[5]) if len(r) > 5 else None,
                            to_float(r[6]) if len(r) > 6 else None,
                        )
                    )
                cur.executemany(
                    f"INSERT INTO {table} (children_count_category, year_2011_count, year_2011_percent, year_2016_count, year_2016_percent, year_2022_count, year_2022_percent) VALUES (?,?,?,?,?,?,?)",
                    data,
                )

            if sec == "T1":
                insert_fam_t1(section)
            elif sec == "G1":
                insert_fam_g1(section)
            elif sec == "G2":
                insert_fam_g2(section)
            elif sec == "G3":
                insert_fam_g3(section)
            elif sec == "G4":
                insert_fam_g4(section)
            elif sec == "T2":
                insert_fam_t2(section)
            elif sec == "G5":
                insert_fam_g5(section)
            elif sec == "T3":
                insert_fam_t3(section)
            elif sec == "T3BIS" or sec == "T3BIS".upper():
                insert_fam_t3bis(section)
            elif sec == "T4":
                insert_fam_t4(section)
            else:
                return
        elif code == "FOR":
            # Prefer ASCII normalization here
            def insert_for_t1(secobj):
                table = "for_t1_schooling_by_age_and_sex_2022"
                rows = secobj["rows"]
                data = []
                for r in rows:
                    if len(r) >= 6:
                        data.append(
                            (
                                norm_label(r[0]),
                                to_int(r[1]),
                                to_int(r[2]),
                                to_float(r[3]),
                                to_float(r[4]),
                                to_float(r[5]),
                            )
                        )
                cur.executemany(
                    f"INSERT INTO {table} (age_group, total_population, schooled_population, schooling_rate_total, schooling_rate_male, schooling_rate_female) VALUES (?,?,?,?,?,?)",
                    data,
                )

            def insert_for_g1(secobj):
                table = "for_g1_school_enrollment_rate_by_age"
                rows = secobj["rows"]
                data = [
                    (
                        norm_label(r[0]),
                        to_float(r[1]) if len(r) > 1 else None,
                        to_float(r[2]) if len(r) > 2 else None,
                        to_float(r[3]) if len(r) > 3 else None,
                    )
                    for r in rows
                    if r
                ]
                cur.executemany(
                    f"INSERT INTO {table} (age_group, rate_2011, rate_2016, rate_2022) VALUES (?,?,?,?)",
                    data,
                )

            def insert_for_t2(secobj):
                table = "for_t2_highest_diploma_non_schooled_population_by_sex_2022"
                rows = secobj["rows"]
                data = []
                for r in rows:
                    if not r:
                        continue
                    label = norm_label(r[0])
                    # skip meta rows
                    if (
                        label.lower().startswith("population non scolarisee")
                        or "part des titulaires" in label.lower()
                    ):
                        continue
                    data.append(
                        (
                            label,
                            to_float(r[1]) if len(r) > 1 else None,
                            to_float(r[2]) if len(r) > 2 else None,
                            to_float(r[3]) if len(r) > 3 else None,
                        )
                    )
                cur.executemany(
                    f"INSERT INTO {table} (diploma, total_population, male_population, female_population) VALUES (?,?,?,?)",
                    data,
                )

            def insert_for_g2(secobj):
                table = "for_g2_highest_diploma_non_schooled_population_percentage"
                rows = secobj["rows"]
                data = [
                    (
                        norm_label(r[0]),
                        to_float(r[1]) if len(r) > 1 else None,
                        to_float(r[2]) if len(r) > 2 else None,
                    )
                    for r in rows
                    if r
                ]
                cur.executemany(
                    f"INSERT INTO {table} (diploma, rate_2011, rate_2022) VALUES (?,?,?)",
                    data,
                )

            if sec == "T1":
                insert_for_t1(section)
            elif sec == "G1":
                insert_for_g1(section)
            elif sec == "T2":
                insert_for_t2(section)
            elif sec == "G2":
                insert_for_g2(section)
            else:
                return
        elif code == "LOG":
            # LOG tables: schema uses de-accented ASCII checks -> use norm_label
            def insert_log_t1(secobj):
                table = "log_t1_evolution_of_housing_by_category"
                rows = secobj["rows"]
                data = []
                for r in rows:
                    if len(r) >= 10:
                        data.append(
                            (
                                norm_label(r[0]),
                                *(
                                    to_int(x) if i < 10 else None
                                    for i, x in enumerate(r[1:10], start=1)
                                ),
                            )
                        )
                cur.executemany(
                    f"INSERT INTO {table} (housing_category, year_1968, year_1975, year_1982, year_1990, year_1999, year_2006, year_2011, year_2016, year_2022) VALUES (?,?,?,?,?,?,?,?,?,?)",
                    data,
                )

            def insert_log_t1bis(secobj):
                table = "log_t1bis_housing_categories"
                rows = secobj["rows"]
                data = [
                    (
                        norm_label(r[0]),
                        to_float(r[1]) if len(r) > 1 else None,
                        to_float(r[2]) if len(r) > 2 else None,
                        to_float(r[3]) if len(r) > 3 else None,
                    )
                    for r in rows
                    if r
                ]
                cur.executemany(
                    f"INSERT INTO {table} (housing_category, percent_2011, percent_2016, percent_2022) VALUES (?,?,?,?)",
                    data,
                )

            def insert_log_t2(secobj):
                table = "log_t2_types_of_housing"
                rows = secobj["rows"]
                data = []
                for r in rows:
                    if not r:
                        continue
                    data.append(
                        (
                            norm_label(r[0]),
                            to_int(r[1]) if len(r) > 1 else None,
                            to_float(r[2]) if len(r) > 2 else None,
                            to_int(r[3]) if len(r) > 3 else None,
                            to_float(r[4]) if len(r) > 4 else None,
                            to_int(r[5]) if len(r) > 5 else None,
                            to_float(r[6]) if len(r) > 6 else None,
                        )
                    )
                cur.executemany(
                    f"INSERT INTO {table} (housing_type, number_2011, percent_2011, number_2016, percent_2016, number_2022, percent_2022) VALUES (?,?,?,?,?,?,?)",
                    data,
                )

            def insert_log_t2bis(secobj):
                table = "log_t2bis_contributions_to_change_in_main_residences"
                rows = secobj["rows"]
                data = [
                    (
                        norm_label(r[0]),
                        to_int(r[1]) if len(r) > 1 else None,
                        to_float(r[2]) if len(r) > 2 else None,
                        to_int(r[3]) if len(r) > 3 else None,
                        to_float(r[4]) if len(r) > 4 else None,
                    )
                    for r in rows
                    if r
                ]
                cur.executemany(
                    f"INSERT INTO {table} (contribution_type, change_2011_2016, percent_2011_2016, change_2016_2022, percent_2016_2022) VALUES (?,?,?,?,?)",
                    data,
                )

            def insert_log_t3(secobj):
                table = "log_t3_main_residences_by_number_of_rooms"
                rows = secobj["rows"]
                data = [
                    (
                        norm_label(r[0]),
                        to_int(r[1]) if len(r) > 1 else None,
                        to_float(r[2]) if len(r) > 2 else None,
                        to_int(r[3]) if len(r) > 3 else None,
                        to_float(r[4]) if len(r) > 4 else None,
                        to_int(r[5]) if len(r) > 5 else None,
                        to_float(r[6]) if len(r) > 6 else None,
                    )
                    for r in rows
                    if r
                ]
                cur.executemany(
                    f"INSERT INTO {table} (number_of_rooms, number_2011, percent_2011, number_2016, percent_2016, number_2022, percent_2022) VALUES (?,?,?,?,?,?,?)",
                    data,
                )

            def insert_log_t4(secobj):
                table = "log_t4_average_number_of_rooms_in_main_residences"
                rows = secobj["rows"]
                data = [
                    (
                        norm_label(r[0]),
                        to_float(r[1]) if len(r) > 1 else None,
                        to_float(r[2]) if len(r) > 2 else None,
                        to_float(r[3]) if len(r) > 3 else None,
                    )
                    for r in rows
                    if r
                ]
                cur.executemany(
                    f"INSERT INTO {table} (residence_type, avg_rooms_2011, avg_rooms_2016, avg_rooms_2022) VALUES (?,?,?,?)",
                    data,
                )

            def insert_log_t4bis(secobj):
                table = "log_t4bis_occupancy_index_of_main_residences"
                rows = secobj["rows"]
                data = [
                    (
                        norm_label(r[0]),
                        to_float(r[1]) if len(r) > 1 else None,
                        to_float(r[2]) if len(r) > 2 else None,
                        to_float(r[3]) if len(r) > 3 else None,
                    )
                    for r in rows
                    if r
                ]
                cur.executemany(
                    f"INSERT INTO {table} (occupancy_index, percent_2011, percent_2016, percent_2022) VALUES (?,?,?,?)",
                    data,
                )

            def insert_log_t5(secobj):
                table = "log_t5_main_residences_by_completion_period_2022"
                rows = secobj["rows"]
                data = [
                    (
                        norm_label(r[0]),
                        to_int(r[1]) if len(r) > 1 else None,
                        to_float(r[2]) if len(r) > 2 else None,
                    )
                    for r in rows
                    if r
                ]
                cur.executemany(
                    f"INSERT INTO {table} (completion_period, number, percent) VALUES (?,?,?)",
                    data,
                )

            def insert_log_g1(secobj):
                table = "log_g1_main_residences_by_type_and_completion_period_2022"
                rows = secobj["rows"]
                data = [
                    (
                        norm_label(r[0]),
                        to_int(r[1]) if len(r) > 1 else None,
                        to_int(r[2]) if len(r) > 2 else None,
                    )
                    for r in rows
                    if r
                ]
                cur.executemany(
                    f"INSERT INTO {table} (completion_period, houses, apartments) VALUES (?,?,?)",
                    data,
                )

            def insert_log_t6(secobj):
                table = "log_t6_length_of_stay_in_main_residence_2022"
                rows = secobj["rows"]
                # Skip stray header continuation rows (e.g., 'logement';'personne') and keep only valid categories
                valid = {
                    "Ensemble",
                    "Depuis moins de 2 ans",
                    "De 2 a 4 ans",
                    "De 5 a 9 ans",
                    "10 ans ou plus",
                }
                data = []
                for r in rows:
                    if not r:
                        continue
                    label = norm_label(r[0])
                    if label not in valid:
                        # ignore header fragments or unexpected rows
                        continue
                    data.append(
                        (
                            label,
                            to_int(r[1]) if len(r) > 1 else None,
                            to_float(r[2]) if len(r) > 2 else None,
                            to_int(r[3]) if len(r) > 3 else None,
                            to_float(r[4]) if len(r) > 4 else None,
                            to_float(r[5]) if len(r) > 5 else None,
                        )
                    )
                cur.executemany(
                    f"INSERT INTO {table} (stay_length, households_number, households_percent, households_population, avg_rooms_per_dwelling, avg_rooms_per_person) VALUES (?,?,?,?,?,?)",
                    data,
                )

            def insert_log_g2(secobj):
                table = "log_g2_households_length_of_stay_2022"
                rows = secobj["rows"]
                data = [
                    (norm_label(r[0]), to_float(r[1]) if len(r) > 1 else None)
                    for r in rows
                    if r
                ]
                cur.executemany(
                    f"INSERT INTO {table} (stay_length, households_percent) VALUES (?,?)",
                    data,
                )

            def insert_log_t7(secobj):
                table = "log_t7_main_residences_by_tenure_status"
                rows = secobj["rows"]
                data = []
                for r in rows:
                    if not r:
                        continue
                    label = norm_label(r[0])
                    allowed = {
                        "Ensemble",
                        "Proprietaire",
                        "Locataire",
                        "dont d'un logement HLM loue vide",
                        "Loge gratuitement",
                    }
                    if label not in allowed:
                        continue
                    data.append(
                        (
                            label,
                            to_int(r[1]) if len(r) > 1 else None,
                            to_float(r[2]) if len(r) > 2 else None,
                            to_int(r[3]) if len(r) > 3 else None,
                            to_float(r[4]) if len(r) > 4 else None,
                            to_int(r[5]) if len(r) > 5 else None,
                            to_float(r[6]) if len(r) > 6 else None,
                            to_int(r[7]) if len(r) > 7 else None,
                            to_float(r[8]) if len(r) > 8 else None,
                        )
                    )
                cur.executemany(
                    f"INSERT INTO {table} (tenure_status, number_2011, percent_2011, number_2016, percent_2016, number_2022, percent_2022, persons_number, avg_stay_years) VALUES (?,?,?,?,?,?,?,?,?)",
                    data,
                )

            def insert_log_t8m(secobj):
                table = "log_t8m_main_residences_heating_fuel"
                rows = secobj["rows"]
                data = []
                for r in rows:
                    if not r:
                        continue
                    data.append(
                        (
                            norm_label(r[0]),
                            to_int(r[1]) if len(r) > 1 else None,
                            to_float(r[2]) if len(r) > 2 else None,
                            to_int(r[3]) if len(r) > 3 else None,
                            to_float(r[4]) if len(r) > 4 else None,
                            to_int(r[5]) if len(r) > 5 else None,
                            to_float(r[6]) if len(r) > 6 else None,
                        )
                    )
                cur.executemany(
                    f"INSERT INTO {table} (fuel_type, number_2011, percent_2011, number_2016, percent_2016, number_2022, percent_2022) VALUES (?,?,?,?,?,?,?)",
                    data,
                )

            def insert_log_t9(secobj):
                table = "log_t9_households_car_ownership"
                rows = secobj["rows"]
                data = [
                    (
                        norm_label(r[0]),
                        to_int(r[1]) if len(r) > 1 else None,
                        to_float(r[2]) if len(r) > 2 else None,
                        to_int(r[3]) if len(r) > 3 else None,
                        to_float(r[4]) if len(r) > 4 else None,
                        to_int(r[5]) if len(r) > 5 else None,
                        to_float(r[6]) if len(r) > 6 else None,
                    )
                    for r in rows
                    if r
                ]
                cur.executemany(
                    f"INSERT INTO {table} (car_equipment, number_2011, percent_2011, number_2016, percent_2016, number_2022, percent_2022) VALUES (?,?,?,?,?,?,?)",
                    data,
                )

            if sec == "T1":
                insert_log_t1(section)
            elif sec == "T1BIS":
                insert_log_t1bis(section)
            elif sec == "T2":
                insert_log_t2(section)
            elif sec == "T2BIS":
                insert_log_t2bis(section)
            elif sec == "T3":
                insert_log_t3(section)
            elif sec == "T4":
                insert_log_t4(section)
            elif sec == "T4BIS":
                insert_log_t4bis(section)
            elif sec == "T5":
                insert_log_t5(section)
            elif sec == "G1":
                insert_log_g1(section)
            elif sec == "T6":
                insert_log_t6(section)
            elif sec == "G2":
                insert_log_g2(section)
            elif sec == "T7":
                insert_log_t7(section)
            elif sec == "T8M":
                insert_log_t8m(section)
            elif sec == "T9":
                insert_log_t9(section)
            else:
                return
        elif code == "POP":
            # POP uses ASCII in checks -> use norm_label
            def insert_pop_t0(secobj):
                table = "pop_t0_population_by_age_group"
                rows = secobj["rows"]
                data = [
                    (
                        norm_label(r[0]),
                        to_int(r[1]) if len(r) > 1 else None,
                        to_float(r[2]) if len(r) > 2 else None,
                        to_int(r[3]) if len(r) > 3 else None,
                        to_float(r[4]) if len(r) > 4 else None,
                        to_int(r[5]) if len(r) > 5 else None,
                        to_float(r[6]) if len(r) > 6 else None,
                    )
                    for r in rows
                    if r
                ]
                cur.executemany(
                    f"INSERT INTO {table} (age_group, population_2011, percent_2011, population_2016, percent_2016, population_2022, percent_2022) VALUES (?,?,?,?,?,?,?)",
                    data,
                )

            def insert_pop_g2(secobj):
                table = "pop_g2_population_by_age_group"
                rows = secobj["rows"]
                data = []
                allowed = {
                    "0 a 14 ans",
                    "15 a 29 ans",
                    "30 a 44 ans",
                    "45 a 59 ans",
                    "60 a 74 ans",
                    "75 ans ou plus",
                }
                for r in rows:
                    if not r:
                        continue
                    label = norm_label(r[0])
                    # Normalize 'ou +' to 'ou plus'
                    label = re.sub(r"\bou\s*\+\b", "ou plus", label)
                    if label not in allowed:
                        continue
                    data.append(
                        (
                            label,
                            to_float(r[1]) if len(r) > 1 else None,
                            to_float(r[2]) if len(r) > 2 else None,
                            to_float(r[3]) if len(r) > 3 else None,
                        )
                    )
                cur.executemany(
                    f"INSERT INTO {table} (age_group, percent_2011, percent_2016, percent_2022) VALUES (?,?,?,?)",
                    data,
                )

            def insert_pop_t1(secobj):
                table = "pop_t1_population_history"
                rows = secobj["rows"]
                data = []
                for r in rows:
                    if not r:
                        continue
                    data.append(
                        (
                            norm_label(r[0]),
                            to_float(r[1]) if len(r) > 1 else None,
                            to_float(r[2]) if len(r) > 2 else None,
                            to_float(r[3]) if len(r) > 3 else None,
                            to_float(r[4]) if len(r) > 4 else None,
                            to_float(r[5]) if len(r) > 5 else None,
                            to_float(r[6]) if len(r) > 6 else None,
                            to_float(r[7]) if len(r) > 7 else None,
                            to_float(r[8]) if len(r) > 8 else None,
                            to_float(r[9]) if len(r) > 9 else None,
                        )
                    )
                cur.executemany(
                    f"INSERT INTO {table} (indicator, y1968, y1975, y1982, y1990, y1999, y2006, y2011, y2016, y2022) VALUES (?,?,?,?,?,?,?,?,?,?)",
                    data,
                )

            def insert_pop_t2m(secobj):
                table = "pop_t2m_demographic_indicators"
                rows = secobj["rows"]
                data = []
                for r in rows:
                    if not r:
                        continue
                    label = norm_label(r[0])
                    # Convert symbols like (‰) to schema's '(pour mille)'
                    label = re.sub(r"\(\s*[%\u2030]+\s*\)", "(pour mille)", label)
                    label = re.sub(r"\s+", " ", label).strip()
                    data.append(
                        (
                            label,
                            to_float(r[1]) if len(r) > 1 else None,
                            to_float(r[2]) if len(r) > 2 else None,
                            to_float(r[3]) if len(r) > 3 else None,
                            to_float(r[4]) if len(r) > 4 else None,
                            to_float(r[5]) if len(r) > 5 else None,
                            to_float(r[6]) if len(r) > 6 else None,
                            to_float(r[7]) if len(r) > 7 else None,
                            to_float(r[8]) if len(r) > 8 else None,
                        )
                    )
                cur.executemany(
                    f"INSERT INTO {table} (indicator, period_1968_1975, period_1975_1982, period_1982_1990, period_1990_1999, period_1999_2006, period_2006_2011, period_2011_2016, period_2016_2022) VALUES (?,?,?,?,?,?,?,?,?)",
                    data,
                )

            def insert_pop_t3(secobj):
                table = "pop_t3_population_by_sex_and_age_2022"
                rows = secobj["rows"]
                data = [
                    (
                        norm_label(r[0]),
                        to_int(r[1]) if len(r) > 1 else None,
                        to_float(r[2]) if len(r) > 2 else None,
                        to_int(r[3]) if len(r) > 3 else None,
                        to_float(r[4]) if len(r) > 4 else None,
                    )
                    for r in rows
                    if r
                ]
                cur.executemany(
                    f"INSERT INTO {table} (age_group, men, percent_men, women, percent_women) VALUES (?,?,?,?,?)",
                    data,
                )

            def insert_pop_t3bis(secobj):
                table = "pop_t3bis_population_by_sex_and_age_2022"
                rows = secobj["rows"]
                data = [
                    (
                        norm_label(r[0]),
                        to_int(r[1]) if len(r) > 1 else None,
                        to_float(r[2]) if len(r) > 2 else None,
                        to_int(r[3]) if len(r) > 3 else None,
                        to_float(r[4]) if len(r) > 4 else None,
                    )
                    for r in rows
                    if r
                ]
                cur.executemany(
                    f"INSERT INTO {table} (age_group, men, percent_men, women, percent_women) VALUES (?,?,?,?,?)",
                    data,
                )

            def insert_pop_t4(secobj):
                table = "pop_t4_previous_residence"
                rows = secobj["rows"]
                data = []
                for r in rows:
                    if not r:
                        continue
                    label = norm_label(r[0])
                    # skip total meta row 'Personnes d'1 an ou plus ...'
                    if re.search(r"personnes d'?1 an", label.lower()):
                        # skip total meta row
                        continue
                    data.append(
                        (
                            label,
                            to_int(r[1]) if len(r) > 1 else None,
                            to_float(r[2]) if len(r) > 2 else None,
                            to_int(r[3]) if len(r) > 3 else None,
                            to_float(r[4]) if len(r) > 4 else None,
                            to_int(r[5]) if len(r) > 5 else None,
                            to_float(r[6]) if len(r) > 6 else None,
                        )
                    )
                cur.executemany(
                    f"INSERT INTO {table} (residence_place, population_2011, percent_2011, population_2016, percent_2016, population_2022, percent_2022) VALUES (?,?,?,?,?,?,?)",
                    data,
                )

            def insert_pop_g3(secobj):
                table = "pop_g3_previous_residence_by_age"
                rows = secobj["rows"]
                data = [
                    (
                        norm_label(r[0]),
                        to_float(r[1]) if len(r) > 1 else None,
                        to_float(r[2]) if len(r) > 2 else None,
                    )
                    for r in rows
                    if r
                ]
                cur.executemany(
                    f"INSERT INTO {table} (age_group, same_commune_percent, other_commune_percent) VALUES (?,?,?)",
                    data,
                )

            def insert_pop_t5(secobj):
                table = "pop_t5_population_by_professional_group"
                rows = secobj["rows"]
                data = []
                for r in rows:
                    if not r:
                        continue
                    label = norm_label(re.sub(r"^dont\s+", "", r[0]))
                    # Align with schema that omits the apostrophe in d'entreprise
                    label = label.replace("d'entreprise", "dentreprise")
                    data.append(
                        (
                            label,
                            to_int(r[1]) if len(r) > 1 else None,
                            to_float(r[2]) if len(r) > 2 else None,
                            to_int(r[3]) if len(r) > 3 else None,
                            to_float(r[4]) if len(r) > 4 else None,
                            to_int(r[5]) if len(r) > 5 else None,
                            to_float(r[6]) if len(r) > 6 else None,
                        )
                    )
                cur.executemany(
                    f"INSERT INTO {table} (socio_professional_group, population_2011, percent_2011, population_2016, percent_2016, population_2022, percent_2022) VALUES (?,?,?,?,?,?,?)",
                    data,
                )

            def insert_pop_t6(secobj):
                table = "pop_t6_population_by_sex_age_professional_group_2022"
                rows = secobj["rows"]
                data = []
                for r in rows:
                    if not r:
                        continue
                    label = norm_label(r[0]).replace("d'entreprise", "dentreprise")
                    # Filter out header continuation rows like '15 a 24 ans', keep only schema-allowed labels
                    allowed = {
                        "Ensemble",
                        "Agriculteurs exploitants",
                        "Artisans, commercants, chefs dentreprise",
                        "Cadres et professions intellectuelles superieures",
                        "Professions intermediaires",
                        "Employes",
                        "Ouvriers",
                        "Retraites",
                        "Autres personnes sans activite professionnelle",
                    }
                    if label not in allowed:
                        continue
                    data.append(
                        (
                            label,
                            to_int(r[1]) if len(r) > 1 else None,
                            to_int(r[2]) if len(r) > 2 else None,
                            to_float(r[3]) if len(r) > 3 else None,
                            to_float(r[4]) if len(r) > 4 else None,
                            to_float(r[5]) if len(r) > 5 else None,
                        )
                    )
                cur.executemany(
                    f"INSERT INTO {table} (socio_professional_group, men, women, percent_15_24, percent_25_54, percent_55_plus) VALUES (?,?,?,?,?,?)",
                    data,
                )

            if sec == "T0":
                insert_pop_t0(section)
            elif sec == "G2":
                insert_pop_g2(section)
            elif sec == "T1":
                insert_pop_t1(section)
            elif sec == "T2M":
                insert_pop_t2m(section)
            elif sec == "T3":
                insert_pop_t3(section)
            elif sec == "T3BIS":
                insert_pop_t3bis(section)
            elif sec == "T4":
                insert_pop_t4(section)
            elif sec == "G3":
                insert_pop_g3(section)
            elif sec == "T5":
                insert_pop_t5(section)
            elif sec == "T6":
                insert_pop_t6(section)
            else:
                return
        else:
            # Other families (EMP/FAM/FOR/LOG/POP/IMG...) could be mapped similarly
            return

    # Iterate expected files
    for name in csv_names:
        file_path = os.path.join(city_dir, f"rp2022_{name}.csv")
        if not os.path.exists(file_path):
            # Skip silently if the file isn't downloaded
            continue

        try:
            sections = open_csv(file_path)
        except Exception as e:
            print(f"Skip {file_path}: parse error: {e}")
            continue

        for sec in sections:
            try:
                dispatch_section(sec)
                conn.commit()
            except Exception as e:
                code = sec.get("code", "")
                sid = sec.get("section", "")
                print(f"Insert failed for section {code} {sid}: {e}")

    # After CSV imports, enrich with historic population (XLSX) if available
    try:
        _ensure_pop_hist_tables(cur, create_department_table=(city_code == "06000"))
        hist_df = _load_population_hist_df(out_root=out_root)
        _insert_commune_pop_hist(cur, city_code, hist_df)
        if city_code == "06000":
            _insert_department_pop_hist(cur, hist_df)
        conn.commit()
    except Exception as e:
        print(f"Warning: could not import historic population for {city_code}: {e}")

    cur.close()
    conn.close()

    return db_path


def build_communes_db(
    db_path: Optional[str] = None, departement_code: str = "06", timeout: int = 30
) -> str:
    """Fetch communes from the French public API and create communes.db SQLite.

    - Source: https://geo.api.gouv.fr/departements/{code}/communes
    - Creates a single table 'communes' with columns matching the API payload
      (codesPostaux stored as a comma-separated string for simplicity).

    Args:
        db_path: Destination path for the SQLite file. Defaults to '<repo>/communes.db'.
        departement_code: Department code to fetch (e.g., '06').
        timeout: HTTP timeout in seconds.

    Returns:
        The absolute path to the created SQLite file.
    """
    # Resolve default DB path at repository root (next to this file)
    if db_path is None:
        root_dir = os.path.dirname(__file__) or "."
        db_path = os.path.join(root_dir, "communes.db")

    url = f"https://geo.api.gouv.fr/departements/{departement_code}/communes"

    try:
        resp = requests.get(url, timeout=timeout)
        resp.raise_for_status()
        data = resp.json()
        if not isinstance(data, list):
            raise ValueError("Unexpected API response (not a list)")
    except Exception as e:
        raise RuntimeError(f"Failed to fetch communes from API: {e}")

    # Create/overwrite DB
    conn = sqlite3.connect(db_path)
    cur = conn.cursor()
    cur.execute("DROP TABLE IF EXISTS communes")
    cur.execute(
        """
        CREATE TABLE communes (
            name TEXT,
            code TEXT PRIMARY KEY,
            department_code TEXT,
            siren TEXT,
            epci_code TEXT,
            region_code TEXT,
            postal_codes TEXT,
            population INTEGER
        )
        """
    )

    rows = []
    for item in data:
        name = item.get("nom")
        code = item.get("code")
        department_code = item.get("codeDepartement")
        siren = item.get("siren")
        epci_code = item.get("codeEpci")
        region_code = item.get("codeRegion")
        postal_codes_val = item.get("codesPostaux") or []
        if isinstance(postal_codes_val, list):
            postal_codes_str = ",".join(map(str, postal_codes_val))
        else:
            postal_codes_str = str(postal_codes_val)
        population = item.get("population")
        rows.append(
            (
                name,
                code,
                department_code,
                siren,
                epci_code,
                region_code,
                postal_codes_str,
                population,
            )
        )

    cur.executemany(
        """
        INSERT INTO communes (
            name, code, department_code, siren, epci_code, region_code, postal_codes, population
        ) VALUES (?,?,?,?,?,?,?,?)
        """,
        rows,
    )
    conn.commit()
    cur.close()
    conn.close()

    return os.path.abspath(db_path)


POP_HISTORIC_XLSX = "https://www.insee.fr/fr/statistiques/fichier/3698339/base-pop-historiques-1876-2022.xlsx"


def add_population_history_to_all_codes():
    """Enhance all existing city DBs with historic population data from INSEE XLSX.

    - Downloads the XLSX file from INSEE.
    - For each existing '<city_code>.db' in the current directory, adds a new table
      'pop_historic_population' with columns for years 1876 to 2022.
    - Populates the table with data from the XLSX file matching the city code.

    Returns:
        A list of city codes that were successfully updated.
    """
    try:
        resp = requests.get(POP_HISTORIC_XLSX, timeout=30)
        resp.raise_for_status()
        xlsx_data = resp.content
    except Exception as e:
        raise RuntimeError(f"Failed to download population history XLSX: {e}")

    # Load XLSX into pandas DataFrame
    xls = pd.ExcelFile(BytesIO(xlsx_data))


_POP_HIST_DF_CACHE: Optional[Any] = None


def _load_population_hist_df(out_root: str = os.path.join("data", "csv")) -> Any:
    """Load and cache the population historic XLSX as a DataFrame filtered to DEP == '06'.

    Attempts to read the file from data/csv/06000/base-pop-historiques-1876-2022.xlsx first.
    Falls back to downloading from POP_HISTORIC_XLSX if not found locally.
    """
    global _POP_HIST_DF_CACHE
    if _POP_HIST_DF_CACHE is not None:
        return _POP_HIST_DF_CACHE

    filename = "base-pop-historiques-1876-2022.xlsx"
    # Try multiple candidate locations
    module_dir = os.path.dirname(__file__) or "."
    candidates = [
        os.path.join(out_root, "06000", filename),  # data/csv/06000/
        os.path.join(
            module_dir, "data", "csv", "06000", filename
        ),  # <module>/data/csv/06000/
        os.path.join(module_dir, "csv", "06000", filename),  # <module>/csv/06000/
        os.path.join("csv", "06000", filename),  # ./csv/06000/
    ]
    local_path = next((p for p in candidates if os.path.exists(p)), None)
    try:
        if local_path and os.path.exists(local_path):
            df_pop = pd.read_excel(
                local_path, skiprows=5, dtype={"CODGEO": str, "DEP": str}
            )
        else:
            # Fallback: download
            resp = requests.get(POP_HISTORIC_XLSX, timeout=30)
            resp.raise_for_status()
            df_pop = pd.read_excel(
                BytesIO(resp.content), skiprows=5, dtype={"CODGEO": str, "DEP": str}
            )
    except Exception as e:
        raise RuntimeError(f"Failed to load population history XLSX: {e}")

    # Keep only department 06
    if "DEP" not in df_pop.columns:
        raise RuntimeError("Expected column 'DEP' in population history XLSX")
    df_pop = df_pop[df_pop["DEP"].astype(str) == "06"].copy()
    # Normalize column names
    df_pop.columns = [str(c).strip() for c in df_pop.columns]
    _POP_HIST_DF_CACHE = df_pop
    return df_pop


def _ensure_pop_hist_tables(
    cur: sqlite3.Cursor, create_department_table: bool = False
) -> None:
    """Create pop historic tables.

    Always creates pop_hist_population (per-commune table).
    Additionally creates pop_hist_population_by_commune when create_department_table=True (i.e., for 06000).
    """

    # Only for the 06000 department DB, create the department-wide table
    if create_department_table:
        cur.execute(
            """
            CREATE TABLE IF NOT EXISTS pop_hist_population_by_commune (
                commune_code VARCHAR(5) NOT NULL UNIQUE,
                commune_name VARCHAR(100) NOT NULL,
                y1876 INT, y1881 INT, y1886 INT, y1891 INT, y1896 INT, y1901 INT, y1906 INT,
                y1911 INT, y1921 INT, y1926 INT, y1931 INT, y1936 INT, y1954 INT,
                y1962 INT, y1968 INT, y1975 INT, y1982 INT, y1990 INT, y1999 INT,
                y2006 INT, y2007 INT, y2008 INT, y2009 INT, y2010 INT, y2011 INT, y2012 INT, y2013 INT, y2014 INT, y2015 INT, y2016 INT, y2017 INT, y2018 INT, y2019 INT, y2020 INT, y2021 INT, y2022 INT,
                PRIMARY KEY (commune_code)
            )
            """
        )
    else:
        # Always ensure per-commune table exists in every city DB (excluding 06000)
        cur.execute(
            """
			CREATE TABLE IF NOT EXISTS pop_hist_population (
				indicator VARCHAR(60) NOT NULL UNIQUE CHECK (indicator IN ('Population')),
				y1876 INT, y1881 INT, y1886 INT, y1891 INT, y1896 INT, y1901 INT, y1906 INT,
				y1911 INT, y1921 INT, y1926 INT, y1931 INT, y1936 INT, y1954 INT,
				y1962 INT, y1968 INT, y1975 INT, y1982 INT, y1990 INT, y1999 INT,
				y2006 INT, y2007 INT, y2008 INT, y2009 INT, y2010 INT, y2011 INT, y2012 INT, y2013 INT, y2014 INT, y2015 INT, y2016 INT, y2017 INT, y2018 INT, y2019 INT, y2020 INT, y2021 INT, y2022 INT,
				PRIMARY KEY (indicator)
			)
			"""
        )


def _insert_commune_pop_hist(
    cur: sqlite3.Cursor, city_code: str, df: pd.DataFrame
) -> None:
    """Insert the population history for a single commune into pop_hist_population.

    If not found, table will still exist but remain empty.
    """
    # Years present in the XLSX (provided):
    known_years = [
        1876,
        1881,
        1886,
        1891,
        1896,
        1901,
        1906,
        1911,
        1921,
        1926,
        1931,
        1936,
        1954,
        1962,
        1968,
        1975,
        1982,
        1990,
        1999,
        2006,
        2007,
        2008,
        2009,
        2010,
        2011,
        2012,
        2013,
        2014,
        2015,
        2016,
        2017,
        2018,
        2019,
        2020,
        2021,
        2022,
    ]

    def col_for_year(y: int) -> str:
        if y >= 2006:
            return f"PMUN{y}"
        if y >= 1962:
            return f"PSDC{y}"
        return f"PTOT{y}"

    if "CODGEO" not in df.columns:
        return
    row = df[df["CODGEO"] == str(city_code)].head(1)
    if row.empty:
        return

    values = {}
    for y in known_years:
        col = col_for_year(y)
        if col in df.columns:
            try:
                val = pd.to_numeric(row.iloc[0][col], errors="coerce")
                values[y] = int(val) if pd.notna(val) else None
            except Exception:
                values[y] = None
        else:
            values[y] = None

    placeholders = ",".join(["?"] * (1 + len(known_years)))
    cols_sql = ", ".join([f"y{y}" for y in known_years])
    params = ["Population"] + [values[y] for y in known_years]
    cur.execute(
        f"INSERT OR REPLACE INTO pop_hist_population (indicator, {cols_sql}) VALUES ({placeholders})",
        params,
    )


def _insert_department_pop_hist(cur: sqlite3.Cursor, df: pd.DataFrame) -> None:
    """Insert all communes population history for department into pop_hist_population_by_commune."""
    known_years = [
        1876,
        1881,
        1886,
        1891,
        1896,
        1901,
        1906,
        1911,
        1921,
        1926,
        1931,
        1936,
        1954,
        1962,
        1968,
        1975,
        1982,
        1990,
        1999,
        2006,
        2007,
        2008,
        2009,
        2010,
        2011,
        2012,
        2013,
        2014,
        2015,
        2016,
        2017,
        2018,
        2019,
        2020,
        2021,
        2022,
    ]

    def col_for_year(y: int) -> str:
        if y >= 2006:
            return f"PMUN{y}"
        if y >= 1962:
            return f"PSDC{y}"
        return f"PTOT{y}"

    cols_sql = ", ".join(
        ["commune_code", "commune_name"] + [f"y{y}" for y in known_years]
    )

    data_rows = []
    for _, r in df.iterrows():
        code = str(r.get("CODGEO") or "").strip()
        name = str(r.get("LIBGEO") or "").strip()
        if not code:
            continue
        vals = []
        for y in known_years:
            col = col_for_year(y)
            if col in df.columns:
                try:
                    v = pd.to_numeric(r[col], errors="coerce")
                    vals.append(int(v) if pd.notna(v) else None)
                except Exception:
                    vals.append(None)
            else:
                vals.append(None)
        data_rows.append([code, name] + vals)

    placeholders = ",".join(["?"] * (2 + len(known_years)))
    cur.executemany(
        f"INSERT OR REPLACE INTO pop_hist_population_by_commune ({cols_sql}) VALUES ({placeholders})",
        data_rows,
    )


def populate_all_pop_hist(out_root: str = os.path.join("data", "csv")) -> List[str]:
    """Populate historic population tables for all existing city databases.

    Behavior
    - Scans the given out_root for city directories (5-digit codes).
    - For each directory that contains a matching '<code>.db' file:
      - Ensures pop_hist tables exist (pop_hist_population always; pop_hist_population_by_commune only for 06000).
      - Inserts/updates the per-commune row in pop_hist_population from the XLSX (DEP=06 only).
      - For 06000, also (re)populates the department-wide pop_hist_population_by_commune table.

    Returns a list of city codes successfully processed.
    """
    processed: List[str] = []
    try:
        hist_df = _load_population_hist_df(out_root=out_root)
    except Exception as e:
        raise RuntimeError(f"Failed to load historic population data: {e}")

    if not os.path.isdir(out_root):
        return processed

    for entry in os.listdir(out_root):
        city_code = str(entry).strip()
        # Expect 5-digit commune codes directories
        if not (len(city_code) == 5 and city_code.isdigit()):
            continue
        city_dir = os.path.join(out_root, city_code)
        if not os.path.isdir(city_dir):
            continue
        db_path = os.path.join(city_dir, f"{city_code}.db")
        if not os.path.exists(db_path):
            continue

        conn = None
        cur = None
        try:
            conn = sqlite3.connect(db_path)
            cur = conn.cursor()
            _ensure_pop_hist_tables(cur, create_department_table=(city_code == "06000"))
            _insert_commune_pop_hist(cur, city_code, hist_df)
            if city_code == "06000":
                _insert_department_pop_hist(cur, hist_df)
            conn.commit()
            processed.append(city_code)
        except Exception as e:
            # Keep going for other cities, just report minimal info
            print(f"Warning: could not populate historic population for {city_code}: {e}")
        finally:
            try:
                if cur is not None:
                    cur.close()
            except Exception:
                pass
            try:
                if conn is not None:
                    conn.close()
            except Exception:
                pass

    return processed


if __name__ == "__main__":
    # Créer la base de données pour 06000 (département entier)
    print("Creating database for 06000...")
    csv_to_sqlite("06000")
    
    # Peupler l'historique de population
    print("Populating population history...")
    populate_all_pop_hist()
    
    print("✅ Done! Database created successfully.")
