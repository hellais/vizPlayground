import json
doc = []
with open("size_date.txt") as f:
    for line in f:
        parts = line.split(" ")
        date = parts[-1].strip()
        data_transfer = parts[-2].strip()
        if data_transfer == "total":
            continue
        data_transfer = int(data_transfer)
        doc.append({
            "date": date,
            "data_transfer": data_transfer * 1000
        })

print json.dumps(doc)
