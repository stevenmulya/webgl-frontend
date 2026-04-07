"use client";
import { useEffect, useRef } from "react";

export default function P5Layer({ activeGlobalIndex }: { activeGlobalIndex: number | null }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const p5Instance = useRef<any>(null);

  useEffect(() => {
    if (p5Instance.current) {
      p5Instance.current.setActiveIndex(activeGlobalIndex);
    }
  }, [activeGlobalIndex]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    import("p5").then((p5Module) => {
      const p5 = p5Module.default;

      const sketch = (p: any) => {
        let activeIndex: number | null = null;
        let elements: any[] = [];
        let thunderAlpha = 0;

        p.setActiveIndex = (index: number | null) => {
          activeIndex = index;
          elements = [];
          if (index === 0) for (let i = 0; i < 150; i++) elements.push(new Snow(p));
          if (index === 1) for (let i = 0; i < 200; i++) elements.push(new Rain(p));
          if (index === 2) for (let i = 0; i < 100; i++) elements.push(new Storm(p));
          if (index === 3) for (let i = 0; i < 80; i++) elements.push(new Sunny(p));
          if (index === 4) for (let i = 0; i < 50; i++) elements.push(new Wind(p));
          if (index === 5) for (let i = 0; i < 200; i++) elements.push(new Star(p));
        };

        p.setup = () => {
          p.createCanvas(p.windowWidth, p.windowHeight);
        };

        p.draw = () => {
          p.clear();
          if (activeIndex === null) return;

          if (activeIndex === 2 && p.random(1) > 0.97) thunderAlpha = 255;
          if (thunderAlpha > 0) {
            p.fill(200, 206, 212, thunderAlpha);
            p.rect(0, 0, p.width, p.height);
            thunderAlpha -= 20;
          }

          elements.forEach(el => {
            el.update();
            el.show();
          });
        };

        class Snow {
          p: any; pos: any; vel: any; size: number;
          constructor(p: any) {
            this.p = p;
            this.pos = p.createVector(p.random(p.width), p.random(-p.height, 0));
            this.vel = p.createVector(p.random(-1, 1), p.random(1, 3));
            this.size = p.random(2, 5);
          }
          update() {
            this.pos.add(this.vel);
            if (this.pos.y > this.p.height) this.pos.y = -10;
          }
          show() {
            this.p.noStroke();
            this.p.fill(200, 206, 212, 180);
            this.p.circle(this.pos.x, this.pos.y, this.size);
          }
        }

        class Rain {
          p: any; x: number; y: number; l: number; s: number;
          constructor(p: any) {
            this.p = p;
            this.x = p.random(p.width);
            this.y = p.random(-p.height, 0);
            this.l = p.random(10, 20);
            this.s = p.random(10, 20);
          }
          update() {
            this.y += this.s;
            if (this.y > this.p.height) this.y = p.random(-20, 0);
          }
          show() {
            this.p.stroke("#0f68ff");
            this.p.strokeWeight(1);
            this.p.line(this.x, this.y, this.x, this.y + this.l);
          }
        }

        class Storm {
          p: any; x: number; y: number; s: number;
          constructor(p: any) {
            this.p = p;
            this.x = p.random(p.width);
            this.y = p.random(-p.height, 0);
            this.s = p.random(20, 30);
          }
          update() {
            this.y += this.s;
            this.x -= 2;
            if (this.y > this.p.height) { this.y = -10; this.x = p.random(p.width); }
          }
          show() {
            this.p.stroke(200, 206, 212, 200);
            this.p.strokeWeight(2);
            this.p.line(this.x, this.y, this.x - 5, this.y + 15);
          }
        }

        class Sunny {
          p: any; pos: any; v: any; a: number;
          constructor(p: any) {
            this.p = p;
            this.pos = p.createVector(p.random(p.width), p.random(p.height));
            this.v = p.createVector(p.random(-0.5, 0.5), p.random(-0.5, 0.5));
            this.a = p.random(255);
          }
          update() {
            this.pos.add(this.v);
            if (this.pos.x < 0 || this.pos.x > this.p.width) this.v.x *= -1;
            if (this.pos.y < 0 || this.pos.y > this.p.height) this.v.y *= -1;
          }
          show() {
            this.p.noStroke();
            this.p.fill(200, 206, 212, p.sin(this.p.frameCount * 0.02) * 100 + 100);
            this.p.circle(this.pos.x, this.pos.y, p.random(1, 3));
          }
        }

        class Wind {
          p: any; x: number; y: number; offset: number;
          constructor(p: any) {
            this.p = p;
            this.x = p.random(-200, p.width);
            this.y = p.random(p.height);
            this.offset = p.random(1000);
          }
          update() {
            this.x += 5;
            if (this.x > this.p.width) this.x = -200;
          }
          show() {
            this.p.noFill();
            this.p.stroke(200, 206, 212, 50);
            p.beginShape();
            for(let i=0; i<10; i++) {
              let nx = this.x + i * 10;
              let ny = this.y + p.noise(this.offset + i * 0.1) * 50;
              p.vertex(nx, ny);
            }
            p.endShape();
          }
        }

        class Star {
          p: any; x: number; y: number; z: number;
          constructor(p: any) {
            this.p = p;
            this.x = p.random(-p.width, p.width);
            this.y = p.random(-p.height, p.height);
            this.z = p.random(p.width);
          }
          update() {
            this.z -= 10;
            if (this.z < 1) {
              this.z = this.p.width;
              this.x = this.p.random(-this.p.width, this.p.width);
              this.y = this.p.random(-this.p.height, this.p.height);
            }
          }
          show() {
            let sx = p.map(this.x / this.z, 0, 1, 0, p.width) + p.width/2;
            let sy = p.map(this.y / this.z, 0, 1, 0, p.height) + p.height/2;
            let r = p.map(this.z, 0, p.width, 8, 0);
            this.p.noStroke();
            this.p.fill("#0f68ff");
            this.p.circle(sx, sy, r);
          }
        }

        p.windowResized = () => {
          p.resizeCanvas(p.windowWidth, p.windowHeight);
        };
      };

      if (containerRef.current) {
        p5Instance.current = new p5(sketch, containerRef.current);
        p5Instance.current.setActiveIndex(activeGlobalIndex); 
      }
    });

    return () => {
      if (p5Instance.current) {
        p5Instance.current.remove();
        p5Instance.current = null;
      }
    };
  }, []);

  return <div ref={containerRef} className="absolute inset-0 z-10 w-full h-screen pointer-events-none" />;
}