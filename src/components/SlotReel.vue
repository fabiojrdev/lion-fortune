<template>
  <div class="slot-reel" :class="{ spinning: spinning }">
    <ul class="reel">
      <li
        v-for="(symbol, index) in visibleSymbols"
        :key="index"
        class="reel-symbol"
      >
        <img
          v-if="
            typeof symbol === 'string' &&
            (symbol.includes('/assets/') ||
              symbol.includes('png') ||
              symbol.includes('jpg'))
          "
          draggable="false"
          :src="require(`@/assets/${symbol.split('/assets/').pop()}`)"
          alt="symbol"
          class="symbol-image"
        />
        <span v-else>
          {{ typeof symbol === "object" ? symbol.symbol : symbol }}
        </span>
      </li>
    </ul>
  </div>
</template>

<script>
export default {
  props: {
    symbols: Array,
    spinning: Boolean,
    combinationChance: Number,
  },
  data() {
    return {
      visibleSymbols: this.getInitialSymbols(),
    };
  },
  watch: {
    spinning(newVal) {
      if (newVal) {
        this.startSpinning();
      } else {
        this.stopSpinning();
      }
    },
  },
  methods: {
    startSpinning() {
      this.symbolInterval = setInterval(() => {
        const newSymbol = this.getRandomSymbol(this.symbols);
        // Duplica os símbolos para criar a ilusão de continuidade
        this.visibleSymbols.push(newSymbol.symbol || newSymbol);
        if (this.visibleSymbols.length > 3) {
          // Ajuste para manter sempre 6 ou mais símbolos
          this.visibleSymbols.shift();
        }
      }, 150);
    },
    stopSpinning() {
      clearInterval(this.symbolInterval);
      this.visibleSymbols = this.visibleSymbols.map((symbol) =>
        typeof symbol === "object" ? symbol.symbol : symbol
      );
    },
    getInitialSymbols() {
      return Array.from(
        { length: 3 },
        () => this.getRandomSymbol(this.symbols).symbol
      );
    },
    getRandomSymbol(symbols) {
      const weightedSymbols = symbols.flatMap((symbol) =>
        symbol.chance > 0
          ? Array(Math.ceil(symbol.chance * 100)).fill(symbol)
          : []
      );
      if (weightedSymbols.length === 0) {
        throw new Error("No valid symbols available for selection.");
      }
      return weightedSymbols[
        Math.floor(Math.random() * weightedSymbols.length)
      ];
    },
  },
};
</script>

<style scoped>
.slot-reel {
  /* -webkit-user-drag: none;
  user-select: none;
  pointer-events: none; */
  margin-top: 60px;
  width: 100px;
  height: 340px;
  overflow: hidden;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  /* border-right: 4px solid rgba(255, 217, 0, 0.587); */
}
.slot-reel:last-child {
  border-right: none; /* Remove a borda direita do último item */
}

.reel {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  /* animation: loop 0s linear infinite; */
}

@keyframes loop {
  0% {
    transform: translateY(0);
  }
  100% {
    transform: translateY(-100%);
  }
}

.reel-symbol {
  font-size: 20px;
  text-align: center;
}

.symbol-image {
  -webkit-user-drag: none;
  user-select: none;
  pointer-events: none;
  z-index: 25;
  width: 70px;
  height: 70px;
}

.spinning .reel-symbol {
  animation: scroll 3s cubic-bezier(0.5, 0, 0.5, 1) 1,
    blur 3s cubic-bezier(0.5, 0, 0.5, 1) 1;
}

/* @keyframes scroll {
  0% {
    transform: translateY(0);
  }
  90% {
    transform: translateY(calc(-100% + 328px));
  }
  100% {
    transform: translateY(calc(-100% + 332px));
  }
} */

.spinning .reel-symbol {
  animation: scroll 3s cubic-bezier(0.5, 0, 0.5, 1),
    blur 3s cubic-bezier(0.5, 0, 0.5, 1);
  will-change: transform, filter;
}

@keyframes blur {
  0% {
    filter: blur(0);
  }
  10% {
    filter: blur(0);
  }
  30% {
    filter: blur(6px);
  }
  60% {
    filter: blur(6px);
  }
  80% {
    filter: blur(0);
  }
}
</style>
