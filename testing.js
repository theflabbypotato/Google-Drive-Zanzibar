const { Permit, TenantsApi } = require("permitio"); // import
const express = require("express");
const app = express();
const port = 4000; // port

/************ DOCKER CONTAINER **************/ 
/*
After installing docker, in terminal run:

docker run -it -p 7766:7000 --env PDP_DEBUG=True --env PDP_API_KEY=<YOUR_API_KEY> permitio/pdp-v2:latest

Mine:
docker run -it -p 7766:7000 --env PDP_DEBUG=True --env PDP_API_KEY=permit_key_fe8nvJIkCSnjZSMmByItY1JUs9KqwIwrz6qVO7CDm7DfUi7DuUuhesGXE26kttWWC0O1jauoifyPhoJi6uJowo permitio/pdp-v2:latest

*/

/************ PERMIT **************/ 

const permit = new Permit({
    // in production, you might need to change this url to fit your deployment
    // try: 
    // http://localhost:7766 
    // or if that doesnt work for pdp
    // https://cloudpdp.api.permit.io

    pdp: 'http://localhost:7766',
    // your api key
    token: 'permit_key_fe8nvJIkCSnjZSMmByItY1JUs9KqwIwrz6qVO7CDm7DfUi7DuUuhesGXE26kttWWC0O1jauoifyPhoJi6uJowo',
});

/************ SETTING UP RESOURCE INSTANCES **************/ 
// NEEDED IF NOT SET UP IN PERMIT.IO
const setupPermit = async() => {
    // sync users
    await permit.api.syncUser({
        key: "john@acme.com",
    });

    await permit.api.syncUser({
        key: "jane@acme.com",
    });

    // resource instances
    await permit.api.resourceInstances.create({
        resource: "file",
        key: "2023_report",
        tenant: "default",
    });

    await permit.api.resourceInstances.create({
        resource: "folder",
        key: "finance",
        tenant: "default",
    });

    // assign roles
    await permit.api.roleAssignments.assign({
        user: "john@acme.com",
        role: "viewer",
        resource_instance: "file:2023_report",
    });

    await permit.api.roleAssignments.assign({
        user: "jane@acme.com",
        role: "editor",
        resource_instance: "folder:finance",
    });

    // create relationship tuples
    await permit.api.relationshipTuples.create({
        subject: "folder:finance",
        relation: "parent",
        object: "file:2023_report",
    });

    // create account and setup admin permissions
    await permit.api.resourceInstances.create({
        resource: "account",
        key: "acme",
        tenant: "default",
    });

    await permit.api.relationshipTuples.create({
        subject: "account:acme",
        relation: "account",
        object: "folder:finance",
    });

    await permit.api.relationshipTuples.create({
        subject: "account:acme",
        relation: "account",
        object: "file:2023_report",
    });

    // general access to "everyone in account"
    await permit.api.resourceRelations.create("file", {
        key: "account_global",
        name: "Account Global",
        subject_resource: "account",
    });

    await permit.api.resourceRoles.update("file", "editor", {
        granted_to: {
            users_with_role: [
                {
                    linked_by_relation: "parent",
                    on_resource: "folder",
                    role: "editor",
                },
                {
                    linked_by_relation: "account_global",
                    on_resource: "account",
                    role: "member",
                },
            ],
        },
    });
}

/************ CHECK PERMISSIONS **************/ 
const checkPermissions = async() => {
    const canJohnRead = await permit.check(
        // user
        "john@acme.com",
        // action
        "read",
        // resource
        {
            type: "file",
            key: "2023_report",
        }
    );
    if (canJohnRead) {
        console.log("John can read 2023_report.");
    } else {
        console.log("John cannot read 2023_report.");
    }

    const canJohnUpdate = await permit.check(
        // user
        "john@acme.com",
        // action
        "update",
        // resource
        {
            type: "file",
            key: "2023_report",
        }
    );
    if (canJohnUpdate) {
        console.log("John can update 2023_report.");
    } else {
        console.log("John cannot update 2023_report.");
    }
    
    const canJaneRead = await permit.check(
        // user
        "jane@acme.com",
        // action
        "update",
        // resource
        {
            type: "file",
            key: "2023_report",
        }
    );
    if (canJaneRead) {
        console.log("Jane can update 2023_report.");
    } else {
        console.log("Jane cannot update 2023_report.");
    }
}

// If not set up in permit.io: setupPermit().then(() => checkPermissions()).catch(console.error);

// otherwise
checkPermissions().catch(console.error);

// You can open http://localhost:4000 to invoke this http
// endpoint, and see the outcome of the permission check.

app.get('/check-permissions', async (req, res) => {
    try {
        const canJohnRead = await permit.check("john@acme.com", "read", { type: "file", key: "2023_report" });
        res.send(`John can read 2023_report: ${canJohnRead}`);
    } catch (error) {
        res.status(500).send(`Error checking permissions: ${error.message}`);
    }
});
  
app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`);
});
