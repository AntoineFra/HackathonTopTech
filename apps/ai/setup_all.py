from fetch_csv import download_insee_csvs
from csv_to_sqlite import build_communes_db, csv_to_sqlite

if __name__ == "__main__":
    for code in range(6000, 6164):
        city_code = str(code).zfill(5)
        result = download_insee_csvs(city_code, pause=0.2)
        print(
            f"Download summary for city code {city_code}: Successful downloads: {len(result['ok'])}, Failed downloads: {len(result['failed'])}"
        )
        if result["failed"]:
            for failure in result["failed"]:
                print(f"    - {failure['file']}: {failure['error']}")

    build_communes_db()
    for code in range(6000, 6164):
        city_code = str(code).zfill(5)
        result = csv_to_sqlite(city_code)
        print(f"Created DB for city {city_code}: {result}")
