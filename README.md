# ASU_Navigator Project
Project Description:
The project will allow students to upload their schedules to derive the most time-efficient method for traveling to each class to help college students find the locations of their classes.

Dependencies:
Google Maps API Key can be obtained here: https://developers.google.com/maps/documentation/javascript/get-api-key

Tech Stack:
- frontend: HTML/CSS/TS
- backend: tRPC
    - typescript is well-supported by google maps docs & sdk
    - having everything in one language is nice
    - Using tRPC may be a good choice due to the ability to easily prevent having to repeat yourself through the middleware, wrappers, and other syntactic elements.
    - less bloated than other full-fledged frameworks
- authentication: login with google
    - simple, just need to check if they’re logged in with ASU email
- infra/platform: docker
    - nice to make sure everyone is running on the same environment
- external datasource: Google Maps API

![alt text](image.png)