notificationManager
===================

This app retrieves your recent notifications from Trello, stores them in a MySQL db and posts them to the client

requirements: must have mysql server running on your machine as root with no password, a database named 'testdb' with a table named 'users2'

notes:
must reenter trello username upon refresh
may take some time to load data upon signup

Note worthy files:
  sqlToClient.js- main server
  public/sqlToClient.html -main html page
  public/script/sqlToClientScript.js -main script
  public/content/...css -stylesheet
  
everyghing else is support files and/or node modules
