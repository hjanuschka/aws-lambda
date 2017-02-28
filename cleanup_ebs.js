/*
Removes all unattached EBS volumes.
*/

var AWS = require("aws-sdk");
var ec2 = new AWS.EC2();

exports.handler = (event, context, callback) => {
    var params = {
        Filters: [{
            Name: "status",
            Values: [
                "available"
            ]
        }]
    };
    ec2.describeVolumes(params, function(err, data) {
        if (err) {
            callback(err, "FAILED"); // an error occurred
            return;
        }
        var proms = [];
        data.Volumes.forEach(function(v) {
            proms.push(deleteVolume(v))
        })
        Promise.all(proms).then(function() {
          console.log("all done");
          callback(null, "ALL DONE")
        })
    });
};


function deleteVolume(volume) {
  return new Promise(function(resolve, reject) {
    var params = {
        VolumeId: volume.VolumeId
    };
    ec2.deleteVolume(params, function(err, data) {
        if (err) {
          reject(err);
          return;
        }
        console.log(data);
        resolve();
    });
  })
  
}
