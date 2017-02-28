/*
Lists all ECR repositories and deletes all UNTAGGED images
*/
var AWS = require("aws-sdk");
var ecr = new AWS.ECR();

var repositories = [];
var images = [];

exports.handler = (event, context, callback) => {
    Promise.resolve()
        .then(getRepositories)
        .then(removeAllImages)
        .then(function() {
            console.log("ALL DONE")
            callback(null, "OK")
        })
        .catch(function(e) {
            callback(e, "Failed");
        })
};

function removeAllImages() {
    var proms = [];
    repositories.forEach(function(repo) {
        proms.push(removeImages(repo.repositoryName));
    })
    return Promise.all(proms);

}

function removeSingleImage(imageId, repo) {
    return new Promise(function(resolve, reject) {

        var params = {
            imageIds: [{
                imageDigest: imageId
            }],
            repositoryName: repo

        }
        ecr.batchDeleteImage(params, function(err, data) {
            if (err) {
                reject(err);
                return;
            }
            console.log("DELETED: ", data.imageIds);
            resolve();
        });

    });
}


function removeImages(repo) {
    return new Promise(function(resolve, reject) {
        var params = {
            repositoryName: repo,
            filter: {
                tagStatus: "UNTAGGED"
            }

        };
        ecr.listImages(params, function(err, data) {
            if (err) {
                reject(err);
                return;
            }
            var proms = [];


            data.imageIds.forEach(function(i) {
                proms.push(removeSingleImage(i.imageDigest, repo))
            })
            Promise.all(proms).then(function() {
                    resolve();
                })
                .catch(function(e) {
                    reject(e);
                })
        });
    })
}

function listImages() {
    return new Promise(function(resolve, reject) {
        var proms = [];
        repositories.forEach(function(repo) {
            proms.push(repoImages(repo.repositoryName))
        })
        Promise.all(proms).then(function() {
                resolve();
            })
            .catch(function(e) {
                reject(e);
            })

    })
}

function getRepositories() {
    return new Promise(function(resolve, reject) {
        var params = {};
        ecr.describeRepositories(params, function(err, data) {
            if (err) {
                reject(err);
                return;
            }
            repositories = data.repositories;
            resolve();
        });
    })
}
