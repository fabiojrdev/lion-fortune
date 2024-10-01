<template>
  <div class="slot-machine">
    <SlotNotify
      v-if="notify.status"
      :title="notify.notifyTitle"
      :description="notify.notifyDesc"
    />
    <div class="reel-container" ref="reelContainer">
      <SlotReel
        ref="reel1"
        :symbols="symbols"
        :spinning="spinning"
        :combinationChance="combinationChance"
      />
      <SlotReel
        ref="reel2"
        :symbols="symbols"
        :spinning="spinning"
        :combinationChance="combinationChance"
      />
      <SlotReel
        ref="reel3"
        :symbols="symbols"
        :spinning="spinning"
        :combinationChance="combinationChance"
      />
    </div>
    <div class="moneyValues">
      <div class="border-info-value">
        <p>Saldo: R$ {{ money.toFixed(2) }}</p>
      </div>
      <div class="border-info-value">
        <p>Total ganho: R$ {{ totalWinnings.toFixed(2) }}</p>
      </div>
    </div>

    <button
      class="turbo-button"
      :class="turboMode ? 'turbo-on' : 'turbo-off'"
      @click="turbo()"
    ></button>
    <SlotButton
      class="spin-button"
      :class="spinning ? 'active-effect' : ''"
      :disabled="spinning"
      @click="spin()"
      text=""
    />
    <button
      class="auto-button"
      :class="autoSpinning ? 'auto-button-inactive' : 'auto-button-active'"
      :disabled="spinning || money < enterPrice"
      @click="autoSpinning ? toggleAutoSpin(false) : toggleAutoSpin(true)"
    ></button>
  </div>
</template>

<script>
import SlotReel from "@/components/SlotReel.vue";
import SlotButton from "@/components/SlotButton.vue";
import SlotNotify from "./SlotNotify.vue";

export default {
  components: {
    SlotReel,
    SlotButton,
    SlotNotify,
  },
  data() {
    return {
      turboMode: false,
      autoMode: true,
      autoSpinning: false,
      timeouts: [],
      symbols: [
        {
          name: "orange", // Comum
          symbol: "@/assets/Laranja.png",
          value: 0.1, // Valor baixo para combinações frequentes
          chance: 10, // Alta chance de aparecer
        },
        {
          name: "fireworks", // Comum
          symbol: "@/assets/fogos.png",
          value: 0.15,
          chance: 8,
        },
        {
          name: "card", // Raro
          symbol: "@/assets/Cartao.png",
          value: 0.4, // Equivalente à entrada
          chance: 5,
        },
        {
          name: "bag", // Super raro
          symbol: "@/assets/Sacola.png",
          value: 0.6,
          chance: 3,
        },
        {
          name: "gold", // Comum
          symbol: "@/assets/Ouro.png",
          value: 0.8,
          chance: 2,
        },
        {
          name: "goldbar", // Extremamente raro
          symbol: "@/assets/Barradeouro.png",
          value: 1.2, // Grande prêmio
          chance: 1,
        },
        {
          name: "wild", // Coringa
          symbol: "@/assets/wild.png",
          value: 0, // Sem valor próprio, mas aumenta combinações
          chance: 2, // Moderadamente raro
        },
      ],
      spinActive: false,
      spinning: false,
      totalWinnings: 0,
      money: 100.0,
      enterPrice: 0.4,
      combinationChance: 0,
      notify: {
        status: false,
        notifyTitle: "",
        notifyDesc: "",
      },
    };
  },
  methods: {
    turbo() {
      if (this.turboMode) {
        this.notify = {
          status: true,
          notifyTitle: "Mode",
          notifyDesc: `Você desativou modo Turbo.`,
        };
      } else {
        this.notify = {
          status: true,
          notifyTitle: "Mode",
          notifyDesc: `Você ativou modo Turbo.`,
        };
      }
      this.turboMode = !this.turboMode;
      setTimeout(() => this.clearNotification(), 2000);
      console.log("Turbo Mode: ", this.turboMode);
    },
    async spin() {
      if (this.spinActive) return;
      this.spinActive = true;
      await this.clearNotification();
      if (this.money < this.enterPrice) {
        this.notify = {
          status: true,
          notifyTitle: "Erro",
          notifyDesc: "Saldo insuficiente!",
        };
        this.spinActive = false;
        return;
      }
      if (this.money >= this.enterPrice) {
        this.money -= this.enterPrice;
        this.spinning = true;

        if (this.turboMode) {
          const timeout = setTimeout(() => {
            this.spinning = false;
            this.checkResults();
          }, 200);
          this.timeouts.push(timeout);
          this.spinActive = false;
          return;
        }
        const timeout = setTimeout(() => {
          if (this.combinationChance === 100) {
            this.forceWinningCombination();
          }
          this.spinning = false;
          this.checkResults();
        }, 3000);
        this.timeouts.push(timeout);
        this.spinActive = false;
      }
    },
    async clearNotification() {
      this.notify = {
        status: false,
        notifyTitle: "",
        notifyDesc: "",
      };
    },
    toggleAutoSpin(params) {
      const statusAuto = params;
      this.autoMode = params;

      setTimeout(() => this.clearNotification(), 3000);

      // Limpar todos os timeouts se autoMode for false
      if (!this.autoMode) {
        this.notify = {
          status: true,
          notifyTitle: "Mode",
          notifyDesc: `Você desativou Auto mode.`,
        };
        this.timeouts.forEach((timeout) => clearTimeout(timeout));
        this.timeouts = []; // Limpa o array após limpar os timeouts
        this.autoSpinning = false;
        return;
      }

      if (this.autoSpinning && !statusAuto) {
        this.autoSpinning = false;
        return;
      }

      if (!this.autoSpinning && statusAuto) {
        this.notify = {
          status: true,
          notifyTitle: "Mode",
          notifyDesc: `Você ativou Auto mode.`,
        };
        this.autoSpinning = true;
        this.timeouts.push(setTimeout(() => this.spin(), 1000)); // Adiciona o timeout ao array
        return;
      }

      if (this.autoSpinning && statusAuto) {
        this.timeouts.push(setTimeout(() => this.spin(), 1000)); // Adiciona o timeout ao array
      }
    },
    forceWinningCombination() {
      const randomCombination = Array(3)
        .fill()
        .map(() =>
          Array(3)
            .fill()
            .map(() => this.getRandomSymbol(this.symbols).symbol)
        );

      this.$refs.reel1.visibleSymbols = randomCombination[0];
      this.$refs.reel2.visibleSymbols = randomCombination[1];
      this.$refs.reel3.visibleSymbols = randomCombination[2];
    },
    adjustProbability(line, multiplier) {
      return line
        .map((symbol) => {
          const random = Math.random();
          const adjustedChance = symbol.chance * multiplier;
          return random < adjustedChance ? symbol : null;
        })
        .filter(Boolean);
    },
    checkResults() {
      const reel1 = this.$refs.reel1.visibleSymbols;
      const reel2 = this.$refs.reel2.visibleSymbols;
      const reel3 = this.$refs.reel3.visibleSymbols;
      let winnings = 0;
      let starCount = 0;

      const symbolValues = this.symbols.reduce((acc, curr) => {
        acc[curr.name] = curr.value;
        return acc;
      }, {});

      const lines = [
        [reel1[0], reel2[0], reel3[0]],
        [reel1[1], reel2[1], reel3[1]],
        [reel1[2], reel2[2], reel3[2]],
        [reel1[0], reel2[1], reel3[2]],
        [reel1[2], reel2[1], reel3[0]],
        ...reel1.map((_, i) => [reel1[i], reel2[i], reel3[i]]),
      ];

      lines.forEach((line, index) => {
        const result = this.calculateLineWinnings(line, symbolValues);
        winnings += result.winnings;
        starCount += result.starCount;
        if (result.winnings > 0) {
          this.drawWinningLine(index);

          // Adiciona a classe de brilho aos símbolos vencedores
          line.forEach((symbol) => {
            if (symbol && symbol.$el) {
              symbol.$el.classList.add("winning-symbol");
            }
          });
        }
      });

      if (starCount === 1) winnings *= 2;
      if (starCount === 2) winnings *= 4;
      if (starCount === 3) winnings *= 10;

      this.totalWinnings += winnings;
      this.money += winnings;

      if (winnings > 0) {
        this.notify = {
          status: true,
          notifyTitle: "Ganhou!",
          notifyDesc: `Você ganhou R$ ${winnings.toFixed(2)}`,
        };
        if (this.turboMode) {
          setTimeout(() => this.clearNotification(), 1000);
          return;
        }
        if (this.autoMode && this.autoSpinning) {
          setTimeout(() => this.toggleAutoSpin(true), 3000);
        }
        setTimeout(() => this.clearNotification(), 500);
      }
      if (this.autoSpinning && winnings <= 0 && this.autoMode) {
        setTimeout(() => this.toggleAutoSpin(true), 1000);
      }

      // setTimeout(() => {
      //   document.querySelectorAll(".winning-symbol").forEach((element) => {
      //     element.classList.remove("winning-symbol");
      //   });
      // }, 3000);
    },
    drawWinningLine(index) {
      const reelContainer = this.$refs.reelContainer;
      if (!reelContainer) return;

      const positions = [
        { top: "24%", left: "0", right: "0", height: "4px" }, // Primeira linha
        { top: "37%", left: "0", right: "0", height: "4px" }, // Segunda linha
        { top: "50%", left: "0", right: "0", height: "4px" }, // Terceira linha
        {
          top: "37%",
          left: "0",
          transform: "rotate(42deg)",
          width: "100%",
          height: "4px",
        }, // Diagonal 1
        {
          top: "37%",
          right: "0",
          transform: "rotate(-42deg)",
          width: "100%",
          height: "4px",
        }, // Diagonal 2
      ];

      const line = document.createElement("div");
      line.classList.add("winning-line");
      Object.assign(line.style, positions[index]);
      line.style.position = "absolute";
      line.style.backgroundColor = "yellow";
      line.style.zIndex = "1000";
      line.style.animation =
        "expandLine 0.5s forwards, shine 2s ease-in-out infinite";

      reelContainer.appendChild(line);

      if (this.turboMode) {
        setTimeout(() => {
          line.remove();
        }, 500);
      }
      setTimeout(() => {
        line.remove();
      }, 3000);
    },
    calculateLineWinnings(line, symbolValues) {
      const uniqueSymbols = new Set(line);
      let wildCount = line.filter(
        (symbol) =>
          symbol === this.symbols.find((s) => s.name === "wild").symbol
      ).length;

      // Caso com 2 símbolos iguais e 1 wild
      if (uniqueSymbols.size === 2 && wildCount === 1) {
        const regularSymbol = line.find(
          (symbol) =>
            symbol !== this.symbols.find((s) => s.name === "wild").symbol
        );
        const symbolObj = this.symbols.find((s) => s.symbol === regularSymbol);
        let winnings = symbolValues[symbolObj.name] * 2; // Multiplica por 2x
        return { winnings, starCount: 0 };
      }

      // Caso com 1 símbolo e 2 wilds
      if (uniqueSymbols.size === 2 && wildCount === 2) {
        const regularSymbol = line.find(
          (symbol) =>
            symbol !== this.symbols.find((s) => s.name === "wild").symbol
        );
        const symbolObj = this.symbols.find((s) => s.symbol === regularSymbol);
        let winnings = symbolValues[symbolObj.name] * 3; // Multiplica por 3x
        return { winnings, starCount: 0 };
      }

      // Caso com todos símbolos iguais ou inclui wild
      if (
        uniqueSymbols.size === 1 ||
        (uniqueSymbols.size === 2 &&
          uniqueSymbols.has(this.symbols.find((s) => s.name === "wild").symbol))
      ) {
        const symbol = line[0];
        const symbolObj =
          typeof symbol === "object"
            ? symbol
            : this.symbols.find((s) => s.symbol === symbol);
        let winnings = symbolValues[symbolObj.name] * 3;

        // Aplicação dos multiplicadores conforme a quantidade de "wild"
        if (wildCount === 1) winnings *= 2;
        if (wildCount === 2) winnings *= 3;

        return { winnings, starCount: 0 };
      }

      return { winnings: 0, starCount: 0 };
    },
  },
  watch: {
    // autoSpinning: {
    //   async handler(val) {
    //     console.log("Auto Spinning:", val); // Verificar se o watch está funcionando
    //     if (val && !this.spinning) {
    //       this.spin();
    //     }
    //     if (!this.spinning) {
    //       return (this.autoSpinning = false);
    //     }
    //   },
    //   immediate: true,
    // },
  },
};
</script>

<style scoped>
.slot-machine {
  width: 320px;
  height: 640px;
  background-color: #ac2b27;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.5);
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 10px;
  position: relative;
  background-image: url("@/assets/backgroundpo.jpg");
  background-size: contain;
  background-repeat: no-repeat;
}

.reel-container {
  display: flex;
  position: relative;
  justify-content: center;
  gap: 10px;
  width: 100%;
  height: 100%; /* Ajuste para ocupar corretamente o espaço */
  border-radius: 10px;
  padding: 10px;
}

.moneyValues {
  font-size: 10px;
  color: white;
  display: flex;
  gap: 20px;
  position: absolute;
  bottom: 18%;
}

.border-info-value {
  background-color: #861d1d;
  border-radius: 10px;
  padding: 3px 15px 3px 15px;
}

.winning-line {
  position: absolute;
  height: 4px;
  background-color: rgba(255, 255, 0, 0.7);
  border-radius: 5px;
  z-index: 10;
  transform-origin: center;
  animation: expandLine 0.5s forwards, shine 2s ease-in-out infinite;
}

@keyframes expandLine {
  0% {
    width: 0;
  }
  100% {
    width: 100%;
  }
}

@keyframes shine {
  0% {
    box-shadow: 0 0 10px 2px rgba(255, 255, 0, 0.5);
  }
  50% {
    box-shadow: 0 0 20px 5px rgba(255, 215, 0, 0.8);
  }
  100% {
    box-shadow: 0 0 10px 2px rgba(255, 255, 0, 0.5);
  }
}

.winning-symbol {
  animation: glowEffect 1s infinite alternate;
}

@keyframes glowEffect {
  0% {
    box-shadow: 0 0 10px yellow, 0 0 20px gold;
    transform: scale(1);
  }
  100% {
    box-shadow: 0 0 20px gold, 0 0 40px yellow;
    transform: scale(1.05);
  }
}

.spin-button {
  position: absolute;
  bottom: 0%;
  width: 100px;
  height: 100px;
  display: flex;
  background-image: url("@/assets/iconentrada.png");
  justify-content: center;
  align-items: center;
  background-size: contain;
  background-repeat: no-repeat;
  border: none;
  background-color: transparent;
}

@keyframes ring {
  0% {
    width: 30px;
    height: 30px;
    opacity: 1;
  }
  100% {
    width: 100px;
    height: 100px;
    opacity: 0;
  }
}

@keyframes scroll {
  0% {
    transform: translateY(0);
  }
  100% {
    transform: translateY(-100%);
  }
}

.spinning .reel-symbol {
  animation: scroll 3s cubic-bezier(0.5, 0, 0.5, 1) infinite;
}

.auto-button {
  width: 25px;
  height: 25px;
  justify-content: center;
  display: flex;
  align-items: center;
  font-size: 10px;
  position: absolute;
  right: 20%;
  bottom: 7%;
  z-index: 3;
  background-image: url("@/assets/iconvalidade.png");
  background-size: contain;
  background-repeat: no-repeat;
  background-color: transparent;
  border: none;
}

.turbo-button {
  width: 25px;
  height: 25px;
  justify-content: center;
  display: flex;
  align-items: center;
  font-size: 10px;
  position: absolute;
  left: 20%;
  bottom: 7%;
  z-index: 3;
  background-size: contain;
  background-repeat: no-repeat;
  background-color: transparent;
  border: none;
}
.turbo-off {
  background-image: url("@/assets/iconturbooff.png");
}
.turbo-on {
  background-image: url("@/assets/iconturbo.png");
}

.auto-on {
}
.auto-off {
}

.active-effect {
  animation: rotateBackground 0.1s linear infinite;
}
@keyframes rotateBackground {
  0% {
    background-position: 0 0;
    transform: rotate(0deg);
  }
  100% {
    background-position: 0 0;
    transform: rotate(360deg);
  }
}
</style>
