if (db.mulesoft_api_date_filters.find().count() === 0) {
  db.mulesoft_api_date_filters.insertMany([
    {
      "dateFilterValue": "2021-08-09"
    },
    {
      "dateFilterValue": "2022-01-04"
    }
  ]);
}
