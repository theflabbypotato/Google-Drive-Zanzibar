# Google-Drive-Zanzibar
Permit.io Project

Mainly Followed this article for practice/guidance:
https://www.permit.io/blog/build-authorization-like-google 

1. Create new directory

2. Create an empty Express.js project inside by writing these commands in the terminal:

`mkdir help-permissions && cd help-permissions && npm init -y && npm install express`

3. Install

`npm install permitio`

`npm install express`

4. Setting up a docker:

https://docs.permit.io/sdk/nodejs/quickstart-nodejs/?_gl=1*1hwtf0j*_gcl_au*MjAwNzY4NzQzMi4xNzE4NjM1Mzcx*_ga*MTMzNjc2MTA1Ny4xNzE4NjM1Mzcx*_ga_SPFKH5NXDE*MTcyMDc5ODIxOC4xMS4xLjE3MjA3OTk5NTQuMC4wLjA. 

Run in terminal (Replace <YOUR_API_KEY> with your actual API key):

`docker run -it -p 7766:7000 --env PDP_DEBUG=True --env PDP_API_KEY=<YOUR_API_KEY> permitio/pdp-v2:latest`

5. Run:

`node testing.js`

6. Should output:

"John can read 2023_report."

"John cannot update 2023_report."

"Jane can update 2023_report."

