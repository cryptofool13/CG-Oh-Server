CREATE TABLE IF NOT EXISTS items VALUES (
    upc UPC PRIMARY KEY,
    item VARCHAR(30) NOT NULL,
    on_hand INT NOT NULL,
    shelf_cap INT NOT NULL,
    case_sz INT NOT NULL,
    price REAL NOT NULL
);
