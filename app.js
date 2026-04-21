class CalculatorEngine {
  constructor() {
    this.reset();
    this.memory = 0;
  }

  reset() {
    this.current = "0";
    this.expression = [];
  }

  input(value) {
    if (/[0-9.]/.test(value)) {
      this.current = this.current === "0" ? value : this.current + value;
    } else {
      this.expression.push(parseFloat(this.current));
      this.expression.push(value);
      this.current = "0";
    }
  }

  calculate() {
    this.expression.push(parseFloat(this.current));
    const result = this.evaluate(this.expression);
    this.expression = [];
    this.current = result.toString();
    return result;
  }

  evaluate(expr) {
    const ops = {
      "+": (a, b) => a + b,
      "-": (a, b) => a - b,
      "*": (a, b) => a * b,
      "/": (a, b) => b === 0 ? "Error" : a / b,
    };

    let stack = [...expr];

    for (let i = 0; i < stack.length; i++) {
      if (stack[i] === "*" || stack[i] === "/") {
        let res = ops[stack[i]](stack[i - 1], stack[i + 1]);
        stack.splice(i - 1, 3, res);
        i--;
      }
    }

    for (let i = 0; i < stack.length; i++) {
      if (stack[i] === "+" || stack[i] === "-") {
        let res = ops[stack[i]](stack[i - 1], stack[i + 1]);
        stack.splice(i - 1, 3, res);
        i--;
      }
    }

    return stack[0];
  }

  percent() {
    this.current = (parseFloat(this.current) / 100).toString();
  }

  memoryAdd() { this.memory += parseFloat(this.current); }
  memorySubtract() { this.memory -= parseFloat(this.current); }
  memoryRecall() { this.current = this.memory.toString(); }
  memoryClear() { this.memory = 0; }
}

// ================= UI =================
class CalculatorUI {
  constructor() {
    this.engine = new CalculatorEngine();
    this.display = document.getElementById("display");
    this.history = document.getElementById("history");
    this.buttonsContainer = document.getElementById("buttons");

    this.initButtons();
    this.bindKeyboard();
  }

  initButtons() {
    const buttons = [
      "7","8","9","/",
      "4","5","6","*",
      "1","2","3","-",
      "0",".","=","+",
      "C","%","M+","M-",
      "MR","MC"
    ];

    buttons.forEach(btn => {
      const b = document.createElement("button");
      b.innerText = btn;
      b.onclick = () => this.handleInput(btn);
      this.buttonsContainer.appendChild(b);
    });
  }

  handleInput(val) {
    if (val === "=") {
      const res = this.engine.calculate();
      this.history.innerText += res + "\n";
    } else if (val === "C") {
      this.engine.reset();
    } else if (val === "%") {
      this.engine.percent();
    } else if (val === "M+") this.engine.memoryAdd();
    else if (val === "M-") this.engine.memorySubtract();
    else if (val === "MR") this.engine.memoryRecall();
    else if (val === "MC") this.engine.memoryClear();
    else this.engine.input(val);

    this.update();
  }

  update() {
    this.display.innerText = this.engine.current;
  }

  bindKeyboard() {
    document.addEventListener("keydown", e => {
      const k = e.key;
      if (!isNaN(k) || ["+","-","*","/","."].includes(k)) {
        this.handleInput(k);
      } else if (k === "Enter") this.handleInput("=");
      else if (k === "Backspace") {
        this.engine.current = this.engine.current.slice(0,-1) || "0";
        this.update();
      }
    });
  }
}

// ================= PARTICLES =================
class Particle {
  constructor(x, y, vx, vy, r, color) {
    this.x = x; this.y = y;
    this.vx = vx; this.vy = vy;
    this.r = r;
    this.color = color;
    this.life = 1;
  }

  update() {
    this.x += this.vx;
    this.y += this.vy;
    this.life -= 0.003;
  }

  draw(ctx) {
    ctx.globalAlpha = this.life;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.r, 0, Math.PI*2);
    ctx.fillStyle = this.color;
    ctx.fill();
    ctx.globalAlpha = 1;
  }
}

class ParticleSystem {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.particles = [];

    this.resize();
    window.addEventListener("resize", () => this.resize());

    this.init();
    this.bind();
    this.animate();
  }

  resize() {
    this.canvas.width = innerWidth;
    this.canvas.height = innerHeight;
  }

  init() {
    for (let i=0;i<50;i++) {
      this.particles.push(this.random());
    }
  }

  random(x,y) {
    return new Particle(
      x || Math.random()*this.canvas.width,
      y || Math.random()*this.canvas.height,
      (Math.random()-0.5)*0.6,
      (Math.random()-0.5)*0.6,
      Math.random()*3+1,
      `hsl(${Math.random()*360},80%,60%)`
    );
  }

  explode(x,y) {
    for (let i=0;i<25;i++) {
      this.particles.push(
        new Particle(x,y,(Math.random()-0.5)*4,(Math.random()-0.5)*4,2,
        `hsl(${Math.random()*360},100%,70%)`)
      );
    }
  }

  bind() {
    this.canvas.addEventListener("click", e => {
      this.explode(e.clientX,e.clientY);
    });
  }

  update() {
    this.particles.forEach(p=>p.update());
    this.particles = this.particles.filter(p=>p.life>0);
    if (this.particles.length<60) this.particles.push(this.random());
  }

  draw() {
    this.ctx.clearRect(0,0,this.canvas.width,this.canvas.height);
    this.particles.forEach(p=>p.draw(this.ctx));
  }

  animate() {
    this.update();
    this.draw();
    requestAnimationFrame(()=>this.animate());
  }
}


new CalculatorUI();
new ParticleSystem(document.getElementById("bgCanvas"));

document.getElementById("themeToggle").onclick = () => {
  document.body.classList.toggle("light");
};





