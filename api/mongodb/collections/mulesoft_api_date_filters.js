if (db.mulesoft_api_date_filters.find().count() === 0) {
  db.mulesoft_api_date_filters.insertMany([
    {
      "dateFilterValue": "2020-08-21"
    },
    {
      "dateFilterValue": "2021-01-30"
    }
  ]);
}