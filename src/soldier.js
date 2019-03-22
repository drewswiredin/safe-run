var Soldier = () => {
  var importedScripts = [];
  var soldierNum = null;

  onmessage = function(message) {
    if (typeof importScripts === "function") {
      if (message.data.type == "initialize") {
        soldierNum = message.data.soldierNum;
      } else if (message.data.type == "run") {
        try {
          if (Array.isArray(message.data.dependencies)) {
            message.data.dependencies.forEach(dep => {
              if (importedScripts.indexOf(dep) == -1) {
                importScripts(dep);
                importedScripts.push(dep);
              }
            });
          }
          var remoteFunction = new Function(
            ...(Array.isArray(message.data.params)? message.data.params : []),
            message.data.remoteFunction
          );
          result = remoteFunction(...(Array.isArray(message.data.args)? message.data.args : []));
          postMessage({
            soldierNum: message.data.soldierNum,
            success: true,
            taskId: message.data.taskId,
            value: result
          });
        } catch (err) {
          postMessage({
            soldierNum: message.data.soldierNum,
            success: false,
            taskId: message.data.taskId,
            value: err.message
          });
        }
      }
    }
  };
};

export default Soldier;
