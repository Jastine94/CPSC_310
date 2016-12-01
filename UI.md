To start the UI, run the command: npm run start (make sure you build before you start the server)

To use the courses explorer: 
- Click the Courses Explore tab once the server has started
- Add the courses dataset into the server
- To sort by more than one filter, hold ctrl + click on the filters you want to sort
	- i.e. ctrl+click on most passing and ctrl+click on courses average to filter by both most passing and courses average


To use the rooms explorer: 
- Click the Rooms Exploere tab once the server has started or if sever is
already started, then go back to the homepage and go to the rooms explorer
- Add the rooms dataset into the server


To use the rooms scheduler:
- If the server was already started, then click the dataset tab
- If both rooms and courses dataset have already been added, then 
you can start scheduling rooms, otherwise add both courses and rooms 
dataset
- Important note: Must input courses then rooms due to our implementation of the querying
- You must input: 
        - course(s) to filter by
            - course can be in the format cpsc221, 221, cpsc
        - building(s) or distance from a building to filter by
            - distance must be an integer in meters
