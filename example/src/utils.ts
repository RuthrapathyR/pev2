import { NodeProp } from "../../src/enums"

let plansData : any = {};
export function time_ago(time : any) {
  switch (typeof time) {
    case "number":
      break
    case "string":
      time = +new Date(time)
      break
    case "object":
      if (time.constructor === Date) time = time.getTime()
      break
    default:
      time = +new Date()
  }
  const time_formats = [
    [2, "1 second ago", "1 second from now"],
    [60, "seconds", 1], // 60
    [120, "1 minute ago", "1 minute from now"], // 60*2
    [3600, "minutes", 60], // 60*60, 60
    [7200, "1 hour ago", "1 hour from now"], // 60*60*2
    [86400, "hours", 3600], // 60*60*24, 60*60
    [172800, "Yesterday", "Tomorrow"], // 60*60*24*2
    [604800, "days", 86400], // 60*60*24*7, 60*60*24
    [1209600, "Last week", "Next week"], // 60*60*24*7*4*2
    [2419200, "weeks", 604800], // 60*60*24*7*4, 60*60*24*7
    [4838400, "Last month", "Next month"], // 60*60*24*7*4*2
    [29030400, "months", 2419200], // 60*60*24*7*4*12, 60*60*24*7*4
    [58060800, "Last year", "Next year"], // 60*60*24*7*4*12*2
    [2903040000, "years", 29030400], // 60*60*24*7*4*12*100, 60*60*24*7*4*12
  ]
  let seconds = (+new Date() - time) / 1000,
    token = "ago",
    list_choice = 1

  if (seconds == 0) {
    return "Just now"
  }
  if (seconds < 0) {
    seconds = Math.abs(seconds)
    token = "from now"
    list_choice = 2
  }
  let i = 0,
    format: (string | number)[]
  while ((format = time_formats[i++]))
    if (seconds < format[0]) {
      if (typeof format[2] == "string") return format[list_choice]
      else {
        return Math.floor(seconds / format[2]) + " " + format[1] + " " + token
      }
    }
  return time
}

function findNodeReplace(data:any,replaceData:any,nodeType:NodeProp){
  if(data != undefined){
    if(nodeType === NodeProp.FUNCTION_SCAN ){
      if(data[NodeProp.NODE_TYPE] === NodeProp.FUNCTION_SCAN && data[NodeProp.FUNCTION_NAME] === NodeProp.WORKER_READ_INTERMEDIATE_RESULTS){
        data[NodeProp.PLANS] = [replaceData];        
      }else{
        if(data[NodeProp.PLANS] != undefined){
          for(let i=0;i<data[NodeProp.PLANS].length;i++){        
            findNodeReplace(data[NodeProp.PLANS][i],replaceData,nodeType);
          }
        }
      }
    }else if(nodeType === NodeProp.CUSTOM_SCAN){    
      if(data[NodeProp.NODE_TYPE] === NodeProp.CUSTOM_SCAN && data[NodeProp.CUSTOM_PLAN_PROVIDER] === NodeProp.DISTDB_CUSTOMSCAN){
        data[NodeProp.PLANS] = [data[NodeProp.SUB_PLANS]];        
      }else{
        if(data[NodeProp.PLANS] != undefined){
          for(let i=0;i<data[NodeProp.PLANS].length;i++){        
            findNodeReplace(data[NodeProp.PLANS][i],"",nodeType);
          }
        }
      }
    }
  }  
}

function taskPerWorker(data:any){
  let finalArr : any = {};
  data.forEach((ele : any)=>{
      if(finalArr[ele[NodeProp.HOST]] == undefined){
          finalArr[ele[NodeProp.HOST]] = [{
              "Task ID":ele[NodeProp.TASK_ID],
              "Total Time":ele[NodeProp.REMOTE_PLAN][0][NodeProp.TOTAL_TIME]
          }];
      }else{
          finalArr[ele[NodeProp.HOST]].push({
            "Task ID":ele[NodeProp.TASK_ID],
            "Total Time":ele[NodeProp.REMOTE_PLAN][0][NodeProp.TOTAL_TIME]
          })
      }
  })
  Object.keys(finalArr).forEach(ele=>{
      finalArr[ele] = finalArr[ele].sort((a : any,b : any)=>{
          return b[NodeProp.TOTAL_TIME] - a[NodeProp.TOTAL_TIME];
      })
  })
  return finalArr;
}

function orderByDesc(data : any){
  let returnData1 : any = [];
  let returnData2 : any = {};
  data.sort((a:any,b:any)=>{
    return  b[NodeProp.REMOTE_PLAN][0][NodeProp.TOTAL_TIME] - a[NodeProp.REMOTE_PLAN][0][NodeProp.TOTAL_TIME]
   })

   data.forEach((ele : any)=>
  {
    returnData1.push(
      {
        "Task ID" : ele[NodeProp.TASK_ID],
        "Total Time" : ele[NodeProp.REMOTE_PLAN][0][NodeProp.TOTAL_TIME]
      }
    )
    returnData2[ele[NodeProp.TASK_ID]] = ele;
  })
   return [returnData1,returnData2];
}

function processDataForTaskPerWorker(data:any){
  if(data != undefined){
    if((data[NodeProp.NODE_TYPE] === NodeProp.CUSTOM_SCAN && data[NodeProp.CUSTOM_PLAN_PROVIDER] === NodeProp.DISTDB_CUSTOMSCAN) || (data[NodeProp.NODE_TYPE].startsWith(NodeProp.SUB_PLAN))){
      data[NodeProp.TASK_PER_WORKER] = taskPerWorker(data[NodeProp.DISTDB_QUERY][NodeProp.JOB][NodeProp.TASKS]);
      let orderByData = orderByDesc(data[NodeProp.DISTDB_QUERY][NodeProp.JOB][NodeProp.TASKS]);
      data[NodeProp.TASK_DESC_ORDER] = orderByData[0];
      plansData[data[NodeProp.NODE_TYPE]] = orderByData[1];
      data[NodeProp.DISTDB_QUERY] = {};
      data[NodeProp.SUB_PLANS] = {};
    }
    if(data[NodeProp.PLANS] != undefined){
      for(let i=0;i<data[NodeProp.PLANS].length;i++){        
        processDataForTaskPerWorker(data[NodeProp.PLANS][i]);
      }
    } 
  }
}



export function processData(data :any){
  let newData = data;
  if(data[0][NodeProp.SUB_PLANS] != null){
    findNodeReplace(newData[0][NodeProp.PLAN],data[0][NodeProp.SUB_PLANS],NodeProp.FUNCTION_SCAN);
  }
  findNodeReplace(newData[0][NodeProp.PLAN],"",NodeProp.CUSTOM_SCAN);
  processDataForTaskPerWorker(newData[0][NodeProp.PLAN]);
  console.log(newData);
  return newData;
}

export function getTaskData(nodeType : any,taskId : any){
  return plansData[nodeType][taskId];
}