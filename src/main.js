import Soldier from "./soldier";

export default class Commander {
  constructor(timeOut = 200) {
    this.timeOut = timeOut
    this.soldiers = [];
    this.soldierStatuses = [];
    this.tasks = [];
    this.taskIdCount = 0;
    this.resolves = {};
    this.rejects = {};
    for (var count = 0; count < navigator.hardwareConcurrency; count++) {
      this.spawnSoldier(count)
    }
  }

  run(dependencies, body, params, args) {
    let taskId = this.taskIdCount++;

    this.tasks.push({
      id: taskId,
      dependencies: dependencies,
      body: body,
      params: params,
      args: args
    });

    let that = this;
    let promise = new Promise(function(resolve, reject) {
      that.resolves[`T${taskId}`] = resolve;
      that.rejects[`T${taskId}`] = reject;
    });

    this.delegateNextTask();
    return promise;
  }

  delegateNextTask() {
    if (this.soldierStatuses.indexOf("ready") > -1 && this.tasks.length > 0) {
      let soldierNum = this.soldierStatuses.indexOf("ready");
      let soldier = this.soldiers[soldierNum];
      let task = this.tasks[0];
      let taskId = task.id
      this.tasks.shift();

      this.soldierStatuses[soldierNum] = "running"

      //Start timer to kill and respawn soldier if task takes too long
      var that = this
      setTimeout(function() {that.abortTask(soldierNum, taskId)}, this.timeOut)

      soldier.postMessage({
        type: "run",
        soldierNum: soldierNum,
        taskId: taskId,
        dependencies: task.dependencies,
        remoteFunction: task.body,
        params: task.params,
        args: task.args,
      });
    }
  }

  abortTask(soldierNum, taskId) {
    if (this.soldierStatuses[soldierNum] == "running") {
      this.killSoldier(soldierNum);
      this.rejects[`T${taskId}`](new Error(`Task aborted after ${this.timeOut}ms.`))
      this.spawnSoldier(soldierNum);
      this.delegateNextTask();
    }
  }

  killSoldier(soldierNum) {
    let soldier = this.soldiers[soldierNum];
    soldier.terminate();
  }

  
  spawnSoldier(soldierNum) {
    this.soldiers[soldierNum] = new Soldier(URL.createObjectURL(new Blob([`(${soldierJS})()`])))
    this.soldierStatuses[soldierNum] = "ready";

    this.soldiers[soldierNum].onmessage = message => {
      if (message.data.success) {
        this.resolves[`T${message.data.taskId}`](message.data.value);
        this.soldierStatuses[message.data.soldierNum] = "ready";
        if (this.tasks.length > 0) {
          run(this.tasks[0]);
        }
      } else if (!message.data.success) {
        this.rejects[`T${message.data.taskId}`](message.data.value);
        this.soldierStatuses[message.data.soldierNum] = "ready";
        if (this.tasks.length > 0) {
          run(this.tasks[0]);
        }
      } else {
        console.log(`Message from soldier: ${message.data.value}`);
      }
    };
  }
}


