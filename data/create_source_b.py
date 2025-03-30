import pandas as pd
import numpy as np
import datetime

# Create sample data
np.random.seed(42)
companies = ["Toyota", "Honda", "Ford", "Chevrolet", "BMW", "Mercedes"]
models = {
    "Toyota": ["Camry", "Corolla", "RAV4", "Highlander", "Tacoma"],
    "Honda": ["Accord", "Civic", "CR-V", "Pilot", "Odyssey"],
    "Ford": ["Mustang", "F-150", "Explorer", "Escape", "Edge"],
    "Chevrolet": ["Silverado", "Equinox", "Malibu", "Traverse", "Tahoe"],
    "BMW": ["3 Series", "5 Series", "X3", "X5", "7 Series"],
    "Mercedes": ["C-Class", "E-Class", "GLC", "GLE", "S-Class"]
}

# Generate 100 records
data = []
start_date = datetime.datetime(2023, 1, 1)
end_date = datetime.datetime(2024, 12, 31)
date_range = (end_date - start_date).days

for _ in range(100):
    company = np.random.choice(companies)
    model = np.random.choice(models[company])
    days = np.random.randint(0, date_range)
    sale_date = start_date + datetime.timedelta(days=days)
    price = np.random.randint(20000, 60000)
    
    data.append({
        "company": company,
        "model": model,
        "sale_date": sale_date.strftime("%Y-%m-%d"),
        "price": price
    })

# Create DataFrame and save to CSV
df = pd.DataFrame(data)
df.to_csv("d:/Amisha/Projects/data-viz-app/data/source_b.csv", index=False)
print("CSV file created successfully!")