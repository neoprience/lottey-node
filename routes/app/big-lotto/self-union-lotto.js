const express = require("express");
const router = express.Router({ mergeParams: true });
const RestMsg = require("../../../common/restmsg");
const {
  LotteryService,
  OptionalService,
} = require("../../../service/big-lotto/big-lotto-service");

router.route("/createSelfBig").post(async (req, res) => {
  const rm = new RestMsg();

  let query = {};
  req.body && (query = req.body);

  try {
    let one = await OptionalService.findOne({ self_number: query.self_number });
    if (one) {
      rm.successMsg("已添加该注彩票");
    } else {
      await OptionalService.create(query);
      rm.successMsg("添加自购大乐透彩票成功");
    }
    res.send(rm);
  } catch (err) {
    console.error("添加自购大乐透彩票失败：");
    console.error(err);
    rm.errorMsg("添加自购大乐透彩票失败：");
    res.status(rm.code).send(rm);
  }
});

router.route("/getBigLottoInfo").get(async (req, res) => {
  const rm = new RestMsg();
  try {
    let result = await LotteryService.judgeAll();
    rm.setResult(result);
    rm.successMsg('获取大乐透中奖数据成功')
    res.send(rm);
  } catch (err) {
    console.error("获取大乐透中奖数据失败");
    console.error(err);
    rm.errorMsg("获取大乐透中奖数据失败");
    res.status(rm.code).send(rm);
  }
});

module.exports = router;
