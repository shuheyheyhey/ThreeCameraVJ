import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass';
import { GlitchPass } from 'three/examples/jsm/postprocessing/GlitchPass';

import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass';
import { CustomShader } from './CustomShader';

class MediaController {
    video: HTMLVideoElement

    constructor() {
        this.video = document.getElementById('video') as HTMLVideoElement
        this.video.autoplay = true
    }

    setupMedia() {
        const success = (stream: any) => {
            this.video.srcObject = stream
            this.video.play();
        }

        const error = (err: Error) => {
            console.log('Failed to get local stream', err)
        }

        navigator.mediaDevices.getUserMedia({
            video: {
                facingMode: { exact: "environment" }
            }, audio: false
        }).then(success)
    }
}

class AudioController {
    analyzer: AnalyserNode

    setupAudio() {
        const success = (stream: any) => {
            const audioContext = new AudioContext()
            // Don't output to speaker
            const gain = audioContext.createGain()
            gain.disconnect()

            const input = audioContext.createMediaStreamSource(stream)
            this.analyzer = audioContext.createAnalyser()
            this.analyzer.smoothingTimeConstant = 0.3;
            this.analyzer.fftSize = 1024
            input.connect(this.analyzer)
        }

        const error = (err: Error) => {
            console.log('Failed to get local stream', err)
        }
        navigator.mediaDevices.getUserMedia({
            video: false, audio: true
        }).then(success)
    }

    getVolume(): number {
        var volume = 0.0
        if (this.analyzer == undefined) { return volume }
        const pcmData = new Float32Array(this.analyzer.fftSize);
        this.analyzer.getFloatTimeDomainData(pcmData)
        for (const index in pcmData) {
            volume += pcmData[index]
        }
        return volume
    }
}

class RendererThreeJS {
    clock: THREE.Clock

    renderer: THREE.WebGLRenderer
    scene: THREE.Scene
    camera: THREE.PerspectiveCamera
    effectComposer: EffectComposer
    customPass: ShaderPass
    mediaController: MediaController
    audioController: AudioController

    constructor() {
        this.clock = new THREE.Clock()
        this.clock.autoStart = true

        this.setupEvent()

        this.mediaController = new MediaController()
        this.audioController = new AudioController()
        this.setupRenderer()
        this.createSceneAndCamera()
        this.setupGeometry()
        this.setupEffectComposer()
    }

    get width(): number {
        return window.innerWidth
    }

    get height(): number {
        return window.innerHeight
    }

    setupRenderer() {
        // レンダラーを作成
        this.renderer = new THREE.WebGLRenderer()
        document.body.appendChild(this.renderer.domElement)
        this.renderer.setSize(this.width, this.height)
    }

    createSceneAndCamera() {
        // シーンを作成
        this.scene = new THREE.Scene()

        // カメラを作成
        this.camera = new THREE.PerspectiveCamera(45, this.width / this.height)
        this.camera.position.set(0, 0, 10)
    }

    setupGeometry() {
        this.mediaController.setupMedia()

        // 箱を作成
        const geometry = new THREE.PlaneBufferGeometry(10 * (this.width / this.height), 10)

        const videoTexture = new THREE.VideoTexture(this.mediaController.video) // 動画テクスチャの作成
        videoTexture.minFilter = THREE.LinearFilter
        videoTexture.magFilter = THREE.LinearFilter
        const material = new THREE.MeshBasicMaterial({ map: videoTexture })

        const box = new THREE.Mesh(geometry, material);
        this.scene.add(box);
    }

    setupEffectComposer() {
        this.effectComposer = new EffectComposer(this.renderer)
        var renderPass = new RenderPass(this.scene, this.camera)
        this.effectComposer.addPass(renderPass)

        var glitchPass = new GlitchPass()
        this.effectComposer.addPass(glitchPass)

        this.customPass = new ShaderPass(CustomShader)
        this.effectComposer.addPass(this.customPass)
    }

    startAnimation() {
        // 毎フレーム時に実行されるループイベント
        const animate = () => {
            requestAnimationFrame(animate)

            this.customPass.uniforms.time.value = this.clock.getDelta()
            this.customPass.uniforms.audio.value = this.audioController.getVolume()
            this.effectComposer.render() // レンダリング
        }
        animate()
    }

    setupEvent() {
        // Audio start
        window.addEventListener("click", async () => {
            this.audioController.setupAudio()
        });

        window.addEventListener("resize", async () => {
            // レンダラーのサイズを調整する
            this.renderer.setPixelRatio(window.devicePixelRatio)
            this.renderer.setSize(this.width, this.height)

            // カメラのアスペクト比を正す
            this.camera.aspect = this.width / this.height
            this.camera.updateProjectionMatrix()
        });

        window.addEventListener("touchmove", () => {

        });
    }
}


// MARK: Window Event
window.addEventListener("DOMContentLoaded", () => {
    const renderer = new RendererThreeJS();
    renderer.startAnimation()
});
