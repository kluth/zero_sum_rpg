import { Injectable } from '@angular/core';
import * as THREE from 'three';

@Injectable({ providedIn: 'root' })
export class ThreeJsTextureService {
  createRaufaserTexture(): THREE.CanvasTexture {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = '#fdfdfd';
    ctx.fillRect(0, 0, 512, 512);
    for(let i=0; i<40000; i++) {
        ctx.fillStyle = Math.random() > 0.5 ? '#f0f0f0' : '#ffffff';
        const x = Math.random() * 512;
        const y = Math.random() * 512;
        ctx.fillRect(x, y, 2, 2);
    }
    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    return tex;
  }

  createRaufaserBumpMap(): THREE.CanvasTexture {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = '#808080';
    ctx.fillRect(0, 0, 512, 512);
    for(let i=0; i<40000; i++) {
        ctx.fillStyle = Math.random() > 0.5 ? '#909090' : '#707070';
        const x = Math.random() * 512;
        const y = Math.random() * 512;
        ctx.fillRect(x, y, 2, 2);
    }
    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    return tex;
  }

  createBrushedSteelTexture(): THREE.CanvasTexture {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = '#333333';
    ctx.fillRect(0, 0, 512, 512);
    ctx.fillStyle = '#444444';
    for(let i=0; i<10000; i++) {
        const y = Math.random() * 512;
        const x = Math.random() * 512;
        const w = 10 + Math.random() * 100;
        ctx.fillRect(x, y, w, 1);
    }
    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    return tex;
  }

  createConcreteTexture(): THREE.CanvasTexture {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = '#555555';
    ctx.fillRect(0, 0, 512, 512);
    for(let i=0; i<20000; i++) {
        ctx.fillStyle = Math.random() > 0.5 ? '#505050' : '#5a5a5a';
        ctx.beginPath();
        ctx.arc(Math.random() * 512, Math.random() * 512, Math.random() * 3, 0, Math.PI * 2);
        ctx.fill();
    }
    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    return tex;
  }

  createCarpetTexture(): THREE.CanvasTexture {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = '#2c3e50';
    ctx.fillRect(0, 0, 256, 256);
    for(let i=0; i<15000; i++) {
        ctx.fillStyle = Math.random() > 0.5 ? '#34495e' : '#22313f';
        ctx.fillRect(Math.random() * 256, Math.random() * 256, 1, 1);
    }
    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    return tex;
  }

  createWoodTexture(): THREE.CanvasTexture {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = '#8b5a2b';
    ctx.fillRect(0, 0, 256, 256);
    ctx.fillStyle = '#6b4226';
    for(let i=0; i<1000; i++) {
        ctx.fillRect(Math.random() * 256, Math.random() * 256, 50 + Math.random() * 100, 2);
    }
    const tex = new THREE.CanvasTexture(canvas);
    return tex;
  }
}
