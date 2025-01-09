import * as THREE from 'three'
import  * as SkeletonUtils from 'three/examples/jsm/utils/SkeletonUtils'
import { useAssetsStore } from '../stores/assets'
 
export class Player {
    constructor(scene, options = {}) {
        this.scene = scene
        this.position = options.position || { x: 0, y: 0, z: 0 }
        this.number = options.number || 1
        this.assetsStore = useAssetsStore()
        this.mesh = null
        this.preloadedModelName = options.modelName || 'c'+this.number
        this.preloadedAnimationName = options.animationName || 'idle'

        // 添加动画相关属性
        this.mixer = null
        this.currentAction = null
        this.clock = new THREE.Clock()
        
        this.createPlayerMesh()
    }

    async createPlayerMesh() {
        
        const preloadedModel = this.assetsStore.getCharacter(this.preloadedModelName)
        
        if (!preloadedModel) {
            console.warn('预加载的模型不存在')
            return
        }

        this.mesh = SkeletonUtils.clone(preloadedModel)
        
        // 创建动画混合器
        this.mixer = new THREE.AnimationMixer(this.mesh)
        
        this.playAnimation(this.preloadedAnimationName)

        this.mesh.position.set(this.position.x, 0.5, this.position.z)
        this.mesh.scale.set(0.01, 0.01, 0.01)

        if (this.position.z > 0) {
            this.mesh.rotation.y = Math.PI
        }

        this.scene.add(this.mesh)
    }


    playAnimation(animationName) {
        const animation = this.assetsStore.getAnimation(animationName)
        if (animation) {
            this.currentAction = this.mixer.clipAction(animation)
            this.currentAction.play()
        }
    }



    // 添加更新方法
    update() {
        if (this.mixer) {
            const delta = this.clock.getDelta()
            this.mixer.update(delta)
        }
    }


    dispose() {
        // 停止并清理动画混合器
        if (this.mixer) {
            this.mixer.stopAllAction()
            this.mixer = null
        }
        
        // 清理网格模型
        if (this.mesh && this.mesh.parent) {
            this.mesh.parent.remove(this.mesh)
            this.mesh = null
        }
    }
} 