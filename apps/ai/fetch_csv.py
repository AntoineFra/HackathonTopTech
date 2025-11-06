import os
import time
from typing import Tuple
from concurrent.futures import ThreadPoolExecutor, as_completed

import requests


url_list = [
    "https://www.insee.fr/fr/statistiques/tableaux/8572063/COM/$1/rp2022_cc_act.csv",
    "https://www.insee.fr/fr/statistiques/tableaux/8574929/COM/$1/rp2022_cc_emp.csv",
    "https://www.insee.fr/fr/statistiques/tableaux/8569208/COM/$1/rp2022_cc_fam.csv",
    "https://www.insee.fr/fr/statistiques/tableaux/8581240/COM/$1/rp2022_cc_for.csv",
    "https://www.insee.fr/fr/statistiques/tableaux/8581193/COM/$1/rp2022_cc_log.csv",
    "https://www.insee.fr/fr/statistiques/tableaux/8581709/COM/$1/rp2022_cc_pop.csv",
    "https://www.insee.fr/fr/statistiques/tableaux/8582065/COM/$1/rp2022_td_img1A.csv",
    "https://www.insee.fr/fr/statistiques/tableaux/8582067/COM/$1/rp2022_td_img1B.csv",
    "https://www.insee.fr/fr/statistiques/tableaux/8582071/COM/$1/rp2022_td_img2A_v2.csv",
    "https://www.insee.fr/fr/statistiques/tableaux/8582073/COM/$1/rp2022_td_img2B.csv",
    "https://www.insee.fr/fr/statistiques/tableaux/8582075/COM/$1/rp2022_td_img3A.csv",
    "https://www.insee.fr/fr/statistiques/tableaux/8582077/COM/$1/rp2022_td_img3B.csv",
    "https://www.insee.fr/fr/statistiques/tableaux/8582079/COM/$1/rp2022_td_nat1.csv",
    "https://www.insee.fr/fr/statistiques/tableaux/8582081/COM/$1/rp2022_td_nat2.csv",
    "https://www.insee.fr/fr/statistiques/tableaux/8582083/COM/$1/rp2022_td_nat3A.csv",
    "https://www.insee.fr/fr/statistiques/tableaux/8582085/COM/$1/rp2022_td_nat3B.csv",
]


def _ensure_dir(path: str) -> None:
    os.makedirs(path, exist_ok=True)


def _filename_from_url(url: str) -> str:
    return url.split("/")[-1]


def _download(
    url: str, dest_path: str, timeout: int = 30, retries: int = 2, backoff: float = 1.5
) -> Tuple[bool, str]:
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36"
    }
    last_err = ""
    for attempt in range(1, retries + 2):  # initial try + retries
        try:
            r = requests.get(url, headers=headers, timeout=timeout)
            if r.status_code == 200 and r.content:
                with open(dest_path, "wb") as f:
                    f.write(r.content)
                return True, ""
            last_err = f"HTTP {r.status_code}"
        except requests.RequestException as e:
            last_err = str(e)
        if attempt <= retries:
            time.sleep(backoff**attempt)
    return False, last_err


def download_insee_csvs(
    city_code: str,
    out_root: str = os.path.join("data", "csv"),
    timeout: int = 30,
    retries: int = 2,
    pause: float = 0.0,
    max_workers: int = 6,
) -> dict:
    """Download all CSVs for a given city code into data/csv/<city_code>/.

    Returns a summary dict with lists of 'ok' and 'failed'.
    """
    city_code = str(city_code).strip()
    out_dir = os.path.join(out_root, city_code)
    _ensure_dir(out_dir)

    summary = {"ok": [], "failed": []}

    def _task(tpl: str) -> Tuple[str, bool, str]:
        url = tpl.replace("$1", city_code)
        fname = _filename_from_url(url)
        dest = os.path.join(out_dir, fname)
        ok, err = _download(url, dest, timeout=timeout, retries=retries)
        return fname, ok, err

    with ThreadPoolExecutor(max_workers=max_workers) as ex:
        futures = []
        for tpl in url_list:
            if pause:
                time.sleep(pause)
            futures.append(ex.submit(_task, tpl))

        for fut in as_completed(futures):
            fname, ok, err = fut.result()
            if ok:
                summary["ok"].append(fname)
            else:
                summary["failed"].append({"file": fname, "error": err})

    return summary


# if __name__ == "__main__":
# 	#download range of city codes
# 	for code in range(6015, 6164):
# 		city_code = str(code).zfill(5)
# 		result = download_insee_csvs(city_code, pause=0.2)
# 		print(f"Download summary for city code {city_code}: Successful downloads: {len(result['ok'])}, Failed downloads: {len(result['failed'])}")
# 		if result["failed"]:
# 			for failure in result["failed"]:
# 				print(f"    - {failure['file']}: {failure['error']}")
