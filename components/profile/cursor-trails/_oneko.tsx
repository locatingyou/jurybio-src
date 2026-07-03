import React, { useEffect } from "react";

const nekoSpriteBase64 =
  "data:image/png;base64,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";
const Oneko = () => {
  useEffect(() => {
    const nekoEl = document.createElement("div");
    let nekoPosX = 32;
    let nekoPosY = 32;
    let mousePosX = 0;
    let mousePosY = 0;
    let frameCount = 0;
    let idleTime = 0;
    let idleAnimation: string | null = null;
    let idleAnimationFrame = 0;
    const nekoSpeed = 10;

    const spriteSets: { [key: string]: number[][] } = {
      idle: [[-3, -3]],
      alert: [[-7, -3]],
      scratch: [
        [-5, 0],
        [-6, 0],
        [-7, 0],
      ],
      tired: [[-3, -2]],
      sleeping: [
        [-2, 0],
        [-2, -1],
      ],
      N: [
        [-1, -2],
        [-1, -3],
      ],
      NE: [
        [0, -2],
        [0, -3],
      ],
      E: [
        [-3, 0],
        [-3, -1],
      ],
      SE: [
        [-5, -1],
        [-5, -2],
      ],
      S: [
        [-6, -3],
        [-7, -2],
      ],
      SW: [
        [-5, -3],
        [-6, -1],
      ],
      W: [
        [-4, -2],
        [-4, -3],
      ],
      NW: [
        [-1, 0],
        [-1, -1],
      ],
    };

    function setSprite(name: string, frame: number): void {
      const sprite = spriteSets[name][frame % spriteSets[name].length];
      nekoEl.style.backgroundPosition = `${sprite[0] * 32}px ${
        sprite[1] * 32
      }px`;
    }

    function resetIdleAnimation(): void {
      idleAnimation = null;
      idleAnimationFrame = 0;
    }

    function idle(): void {
      idleTime += 1;
      if (
        idleTime > 10 &&
        Math.floor(Math.random() * 200) === 0 &&
        idleAnimation == null
      ) {
        idleAnimation = ["sleeping", "scratch"][Math.floor(Math.random() * 2)];
      }
      switch (idleAnimation) {
        case "sleeping":
          if (idleAnimationFrame < 8) {
            setSprite("tired", 0);
            break;
          }
          setSprite("sleeping", Math.floor(idleAnimationFrame / 4));
          if (idleAnimationFrame > 192) {
            resetIdleAnimation();
          }
          break;
        case "scratch":
          setSprite("scratch", idleAnimationFrame);
          if (idleAnimationFrame > 9) {
            resetIdleAnimation();
          }
          break;
        default:
          setSprite("idle", 0);
          return;
      }
      idleAnimationFrame += 1;
    }

    function frame(): void {
      frameCount += 1;
      const diffX = nekoPosX - mousePosX;
      const diffY = nekoPosY - mousePosY;
      const distance = Math.sqrt(diffX ** 2 + diffY ** 2);
      if (distance < nekoSpeed || distance < 48) {
        idle();
        return;
      }
      idleAnimation = null;
      idleAnimationFrame = 0;
      if (idleTime > 1) {
        setSprite("alert", 0);
        idleTime = Math.min(idleTime, 7);
        idleTime -= 1;
        return;
      }
      let direction = diffY / distance > 0.5 ? "N" : "";
      direction += diffY / distance < -0.5 ? "S" : "";
      direction += diffX / distance > 0.5 ? "W" : "";
      direction += diffX / distance < -0.5 ? "E" : "";
      setSprite(direction, frameCount);
      nekoPosX -= (diffX / distance) * nekoSpeed;
      nekoPosY -= (diffY / distance) * nekoSpeed;
      nekoEl.style.left = `${nekoPosX - 16}px`;
      nekoEl.style.top = `${nekoPosY - 16}px`;
    }

    function create(): () => void {
      nekoEl.id = "oneko";
      nekoEl.style.width = "32px";
      nekoEl.style.height = "32px";
      nekoEl.style.position = "fixed";
      nekoEl.style.imageRendering = "pixelated";
      nekoEl.style.left = "16px";
      nekoEl.style.top = "16px";
      nekoEl.style.pointerEvents = "none";
      nekoEl.style.zIndex = "9999";

      document.body.appendChild(nekoEl);

      const handleMouseMove = (event: MouseEvent): void => {
        mousePosX = event.clientX;
        mousePosY = event.clientY;
      };

      document.addEventListener("mousemove", handleMouseMove);
      const interval = setInterval(frame, 100);

      return () => {
        clearInterval(interval);
        document.removeEventListener("mousemove", handleMouseMove);
        if (document.body.contains(nekoEl)) {
          document.body.removeChild(nekoEl);
        }
      };
    }

    const cleanup = create();
    return cleanup;
  }, []);

  return null;
};

export default Oneko;
