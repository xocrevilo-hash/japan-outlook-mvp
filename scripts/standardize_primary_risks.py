import json
from pathlib import Path

PATH = Path("data/companies.json")

with PATH.open("r", encoding="utf-8") as f:
    companies = json.load(f)

changed = 0

for c in companies:
    outlook = c.get("outlook")
    if not outlook:
        continue

    bullets = outlook.get("bullets")
    if not isinstance(bullets, list):
        continue

    for b in bullets:
        if b.get("n") != 5:
            continue

        risks = b.get("risks")
        body = b.get("body")

        # Only convert if risks exist and body is missing or blank
        if isinstance(risks, list) and risks and not body:
            text = " ".join(s.strip().rstrip(".") + "." for s in risks)
            b["body"] = text
            del b["risks"]
            changed += 1

if changed:
    with PATH.open("w", encoding="utf-8") as f:
        json.dump(companies, f, ensure_ascii=False, indent=2)

print(f"Primary Risks standardized for {changed} company(ies).")
