const ServiceGenerator = require("../common/servicegenerator");
const Lottery = require("./model/union-lotto-bo");
const Optional = require("./model/union-optional-bo");

const LotteryService = ServiceGenerator.generate(Lottery);
const OptionalService = ServiceGenerator.generate(Optional);

const lotteryWinList = {
  61: { text: "一等奖", weight: 6, price: "浮动400万～1000万" },
  60: { text: "二等奖", weight: 5, price: "浮动20万～40万" },
  51: { text: "三等奖", weight: 4, price: "3000" },
  41: { text: "四等奖", weight: 3, price: "200" },
  50: { text: "四等奖", weight: 3, price: "10" },
  40: { text: "五等奖", weight: 2, price: "10" },
  31: { text: "五等奖", weight: 2, price: "10" },
  21: { text: "六等奖", weight: 1, price: "5" },
  11: { text: "六等奖", weight: 1, price: "5" },
  "01": { text: "六等奖", weight: 1, price: "5" },
  "00": { text: "未中奖", weight: 0, price: "0" },
  "30": { text: "未中奖", weight: 0, price: "0" },
  "20": { text: "未中奖", weight: 0, price: "0" },
};

LotteryService.judgeAll = async () => {
  //自选彩票list
  let self = await LotteryService.findByList();
  // 机选彩票list
  let union = await OptionalService.findByList();

  let result_list = [];
  // tips:遍历自选彩票
  // 遍历所有期彩票
  union.map((union_one) => {
    // 遍历自购所有期彩票
    self.map((self_one) => {
      let frontArr = [];
      let backArr = [];

      // 遍历当前中奖彩票前区
      union_one.frontZone.map((self_front) => {
        // 遍历当前自购彩票前区
        self_one.frontZone.map((front, front_index) => {
          // 如果当前前区自选值等于中奖彩票值就放入frontArr数组
          if (front == self_front) {
            frontArr.push(front);
          }
        });
      });

      // 如果当前后区自购彩票和中奖彩票相等放入backArr数组
      if (self_one.backZone[0] == union_one.backZone[0]) {
        backArr.push(self_one.backZone);
      }
      let one_result =
        lotteryWinList[String(frontArr.length) + String(backArr.length)];
        if (one_result && one_result.weight != 0) {
        result_list.push({ info: one_result, lottery: self_one });
      }

    });
  });

  return result_list
};


module.exports = {
  LotteryService: LotteryService,
  OptionalService: OptionalService,
};
