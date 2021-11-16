const express = require("express");
const router = express.Router({ mergeParams: true });
const RestMsg = require("../../../common/restmsg");
const {
  LotteryService,
  OptionalService,
} = require("../../../service/union-lotto/union-lotto-service");

router.route("/createUnionLotto").post(async (req, res) => {
  const rm = new RestMsg();

  let query = {};
  req.body && (query = req.body);

  try {
    await LotteryService.create(query);
    rm.successMsg("添加双色球中奖彩票成功");
    res.send(rm);
  } catch (err) {
    console.error("添加双色球中奖彩票失败：");
    console.error(err);
    rm.errorMsg("添加双色球中奖彩票失败：");
    res.status(rm.code).send(rm);
  }
});

module.exports = router;
