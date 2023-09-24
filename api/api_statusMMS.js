const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const constance = require("../constance/constance");
const moment = require("moment");

// import model

const mms_table = require("../models/model_statusMMS");

//mc status [non/operating time]
router.post(
  "/MC_Status_All/:start_date/:end_date/:selectMc",
  async (req, res) => {
    try {
      let { start_date } = req.params;
      let { end_date } = req.params;
      let { selectMc } = req.params;
      let resultdata = await grinding_table.sequelize.query(
        `WITH tb1
      AS
      (
      SELECT  
      iif(DATEPART(HOUR, [occurred])<7,dateadd(day,-1,[occurred]),[occurred]) as occur_new
  , [registered_at]
   ,[occurred]
   ,[mc_status]
   ,[mc_no]
FROM [counter].[dbo].[data_mcstatus]
   where [mc_no] ='${selectMc}' 
   group by [mc_status],iif(DATEPART(HOUR, [occurred])<7,dateadd(day,-1,[occurred]),[occurred])  , [registered_at]
   ,[occurred]
   ,[mc_status]
   ,[mc_no])
    , tb2  as(   select  [mc_status],format(occur_new,'yyyy-MM-dd')  as newDate ,[occurred],[mc_no]
      FROM tb1
    )
    ,tb3 as (select tb2.[newDate]  as [mfg_date],[mc_no],[mc_status],[occurred]
    from tb2
   )
    ,tb4 as (
        SELECT *
          ,lead([occurred]) over(partition by [mc_no] order by [mc_no],[occurred]) AS [NextTimeStamp]
        FROM tb3 
        where tb3.[mfg_date]  between '${start_date}'  and '${end_date}' --= '2023-08-24'
        )
        ,tb5 as (
    select * ,datediff(MINUTE,occurred,NextTimeStamp) as timediff 
    from tb4 where [NextTimeStamp] is not null
   --group by [mfg_date],[mc_no],occurred,NextTimeStamp,[mc_status]
    --order by occurred desc
    ) 
    ,non as (
    select mfg_date,[mc_no], sum(timediff) as non_oper
    from tb5 
    where [mc_status] <> '1'
    group by mfg_date,[mc_no]
    )
    ,oper as ( select mfg_date,[mc_no], sum(timediff) as oper
    from tb5 
    group by mfg_date,[mc_no]
    )
    select non.mfg_date,oper.[mc_no],oper,non_oper
    from non 
    left join oper
    on non.mfg_date = oper.mfg_date
    --where oper > non_oper`
        //       `-- ///////////  non operating [1-5] = all  ///////////
        //       with tb1_min as(
        //       SELECT [occurred],mc_no,[mc_status],format (iif(DATEPART(HOUR, [occurred])<7,dateadd(day,-1,[occurred]),[occurred]),'yyyy-MM-dd') as mfg_date
        //           ,convert(varchar, [occurred], 108) as min_cur
        //         FROM [counter].[dbo].[data_mcstatus]
        //        where  DATEPART(HOUR,[occurred] ) > '12' and /*DATEPART(HOUR,[occurred] ) = '15' and*/ format (iif(DATEPART(HOUR, [occurred])<7,dateadd(day,-1,[occurred]),[occurred]),'yyyy-MM-dd') between '${start_date}'  and '${end_date}'
        //        and mc_no = '${selectMc}' and [mc_status] <> '1'
        //        )
        //        , total_tb1 as (
        //        select mfg_date,MIN(min_cur) as min_date,MAX(min_cur) as max_date,mc_no
        //        from tb1_min
        //        group by mc_no,mfg_date
        //        )
        //        -- //////////  operationg [1-5]   ////////////
        //        ,tb2_min as(
        //       SELECT [occurred],mc_no,[mc_status],format (iif(DATEPART(HOUR, [occurred])<7,dateadd(day,-1,[occurred]),[occurred]),'yyyy-MM-dd') as mfg_date
        //           ,convert(varchar, [occurred], 108) as min_cur
        //         FROM [counter].[dbo].[data_mcstatus]
        //        where  DATEPART(HOUR,[occurred] ) > '12' and /*DATEPART(HOUR,[occurred] ) = '15' and*/  format (iif(DATEPART(HOUR, [occurred])<7,dateadd(day,-1,[occurred]),[occurred]),'yyyy-MM-dd') between '${start_date}'  and '${end_date}'
        //        and mc_no = '${selectMc}' and [mc_status] = '1'
        //        --order by registered_at asc
        //        )
        //        , total_tb2 as (select mfg_date,MIN(min_cur) as min_date,MAX(min_cur) as max_date, mc_no
        //        from tb2_min
        //       group by mc_no,mfg_date)
        //       ,total_all as (
        //        select total_tb1.mfg_date,Upper(total_tb1.mc_no) as mc_no, DATEDIFF(SECOND,total_tb1.min_date, total_tb1.max_date) as nonoper , DATEDIFF(SECOND,total_tb2.min_date, total_tb2.max_date) as oper
        //        from total_tb1
        //        left join total_tb2
        //        on total_tb1.mfg_date = total_tb2.mfg_date)
        //        select mfg_date,mc_no,nonoper,cast((nonoper/(6*3600.00))*100 as decimal(10,2)) as [dec_non]   --,(nonoper*100/(6*3600)) as non
        //        ,oper,cast((oper*100/(6*3600.00)) as decimal(10,2)) as [dec_oper]
        //        from total_all
        //  `
      );

      // console.log(resultdata);
      console.log(resultdata[0].length);
      arrayData = resultdata[0];
      let name_series = ["Operating time", "Non - Operating time"];
      let resultMC_Status = [];
      arrayData.forEach(function (a) {
        if (!this[a.mfg_date]) {
          this[a.mfg_date] = { name: a.mfg_date, data: [] };
          resultMC_Status.push(this[a.mfg_date]);
        }
        this[a.mfg_date].data.push(
          a.oper,
          a.non_oper
          // a.dec_non,
          // a.dec_oper,
        );
      }, Object.create(null));
      // set arr all value
      console.log("resultMC_Status =========", resultMC_Status);
      let getarr1 = [];
      let getarr2 = [];
      for (let index = 0; index < resultMC_Status.length; index++) {
        const item = resultMC_Status[index];
        await getarr1.push(item.data[0]);
        await getarr2.push(item.data[1]);
      }
      let getarr = [];
      getarr.push(getarr1, getarr2);
      // console.log(getarr);
      //set name ball
      let namemc = [];
      for (let index = 0; index < resultMC_Status.length; index++) {
        const item = resultMC_Status[index];
        await namemc.push(item.name);
      }
      //set arr name,data
      let dataset = [];
      for (let index = 0; index < getarr.length; index++) {
        dataset.push({
          name: name_series[index],
          data: getarr[index],
        });
      }

      let resultDate = [];
      arrayData.forEach(function (a) {
        if (!this[a.mfg_date]) {
          this[a.mfg_date] = { name: a.mfg_date };
          resultDate.push(this[a.mfg_date]);
        }
      }, Object.create(null));

      let newDate = [];
      for (let index = 0; index < resultDate.length; index++) {
        const item = resultDate[index];
        await newDate.push(item.name);
      }

      // console.log(BallUsage[0]);
      console.log("==============");
      console.log(dataset);
      console.log(resultDate);

      res.json({
        // resultBall: BallUsage[0],
        result_length:resultdata[0].length,
        result: dataset,
        resultDate: newDate,

        // resultTarget_turn: seriesTarget_new,
      });
    } catch (error) {
      res.json({
        error,
        api_result: constance.NOK,
      });
    }
  }
);

router.get("/gantt_MMS/:start_date/:selectMC", async (req, res) => {
  try {
    const { start_date, selectMC } = req.params;
    let stringMachine = await selectMC.replace("[", "");
    stringMachine = await stringMachine.replace("]", "");
    stringMachine = await stringMachine.replaceAll('"', "'");

    let ganttResult_STOP = await mms_table.sequelize.query(`
      WITH tb1
         AS
         (
         SELECT  
         iif(DATEPART(HOUR, [occurred])<7,dateadd(day,-1,[occurred]),[occurred]) as occur_new
           ,[mc_status]
           ,[occurred]
          
         ,[mc_no]
      FROM [counter].[dbo].[test_mc_status]
      where [mc_no] ='${selectMC}' 
      group by [mc_status],iif(DATEPART(HOUR, [occurred])<7,dateadd(day,-1,[occurred]),[occurred]),[occurred],[mc_no])
       , tb2  as(   select  [mc_status],format(occur_new,'yyyy-MM-dd')  as newDate ,[occurred],[mc_no]
         FROM tb1
       )
       ,tb3 as (select [mc_status],[occurred],tb2.[newDate] as [MfgDate] ,[mc_no]
       from tb2
      )
       ,tb4 as (
           SELECT *
             ,lead([occurred]) over(partition by [mc_no] order by [mc_no],[occurred]) AS [NextTimeStamp]
           FROM tb3 
           where tb3.[MfgDate] = '${start_date}'
           )
           select * from tb4 where [mc_status] = '0' and [NextTimeStamp] is not null
      `);
    console.log(ganttResult_STOP);

    let ganttResult_START = await mms_table.sequelize.query(` WITH tb1
      AS
      (
      SELECT  
      iif(DATEPART(HOUR, [occurred])<7,dateadd(day,-1,[occurred]),[occurred]) as occur_new
        ,[mc_status]
        ,[occurred]
       
      ,[mc_no]
   FROM [counter].[dbo].[test_mc_status]
   where [mc_no] ='${selectMC}' 
   group by [mc_status],iif(DATEPART(HOUR, [occurred])<7,dateadd(day,-1,[occurred]),[occurred]),[occurred],[mc_no])
    , tb2  as(   select  [mc_status],format(occur_new,'yyyy-MM-dd')  as newDate ,[occurred],[mc_no]
      FROM tb1
    )
    ,tb3 as (select [mc_status],[occurred],tb2.[newDate] as [MfgDate] ,[mc_no]
    from tb2
   )
    ,tb4 as (
        SELECT *
          ,lead([occurred]) over(partition by [mc_no] order by [mc_no],[occurred]) AS [NextTimeStamp]
        FROM tb3 
        where tb3.[MfgDate] = '${start_date}'
        )
        select * from tb4 where [mc_status] = '1' and [NextTimeStamp] is not null
      `);
    let ganttResult_ALARM = await mms_table.sequelize.query(` WITH tb1
      AS
      (
      SELECT  
      iif(DATEPART(HOUR, [occurred])<7,dateadd(day,-1,[occurred]),[occurred]) as occur_new
        ,[mc_status]
        ,[occurred]
       
      ,[mc_no]
   FROM [counter].[dbo].[test_mc_status]
   where [mc_no] ='${selectMC}' 
   group by [mc_status],iif(DATEPART(HOUR, [occurred])<7,dateadd(day,-1,[occurred]),[occurred]),[occurred],[mc_no])
    , tb2  as(   select  [mc_status],format(occur_new,'yyyy-MM-dd')  as newDate ,[occurred],[mc_no]
      FROM tb1
    )
    ,tb3 as (select [mc_status],[occurred],tb2.[newDate] as [MfgDate] ,[mc_no]
    from tb2
   )
    ,tb4 as (
        SELECT *
          ,lead([occurred]) over(partition by [mc_no] order by [mc_no],[occurred]) AS [NextTimeStamp]
        FROM tb3 
        where tb3.[MfgDate] = '${start_date}' 
        )
        select * from tb4 where [mc_status] = '2' and [NextTimeStamp] is not null
      `);

    //set data
    let data_STOP = [];
    let data_START = [];
    let data_ALARM = [];

    ganttResult_STOP[0].forEach(async (item) => {
      await data_STOP.push({
        x: item.mc_no,
        y: [
          new Date(item.occurred).getTime(),
          new Date(item.NextTimeStamp).getTime(),
        ],
      });
    });

    console.log(data_STOP);

    ganttResult_START[0].forEach(async (item) => {
      await data_START.push({
        x: item.mc_no,
        y: [
          new Date(item.occurred).getTime(),
          new Date(item.NextTimeStamp).getTime(),
        ],
      });
    });
    console.log(data_START);
    ganttResult_ALARM[0].forEach(async (item) => {
      await data_ALARM.push({
        x: item.mc_no,
        y: [
          new Date(item.occurred).getTime(),
          new Date(item.NextTimeStamp).getTime(),
        ],
      });
    });

    console.log(data_ALARM);

    let series_STOP = { name: "STOP", data: data_STOP };
    let series_START = { name: "START", data: data_START };
    let series_ALARM = { name: "ALARM", data: data_ALARM };

    let series = [series_START, series_STOP, series_ALARM];

    console.log(series);
    res.json({
      series,
    });
  } catch (error) {
    res.json({
      error,
      api_result: constance.NOK,
    });
  }
});



module.exports = router;
