# MonitoringSystem-Core



Database
======
![This is the basic DB modeling.](https://i.imgur.com/jTWui9m.png "This is the db model.")

## Todo
* [ ] Add in each table created_AT
* [x] Add the server routes
* [x] Add the data routes
* [x] Clarify the socket connection front to back to slave and so on

## Socket Explaination
### Client
- Client sends a **client-subscribe** event which contains:
    - serveruuid : For Server clarification
    - auth-key : For User clarification, to chek if user owns this server
- The Server looks for changes on the particular server uuids and sends them
- The Client gets the infos and displays them
- If the user wants to view another server the **client-subscribe** event gets send