import { defineStore } from 'pinia'
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader'

// 创建一个非响应式的缓存对象
const modelCache = {
    characters: {},
    animations: {}
}

export const useAssetsStore = defineStore('assets', {
    state: () => ({
        // 只存储加载状态
        loading: true,
        progress: 0,
        error: null,
        
        // 存储资源的引用名称而不是实际模型
        loadedCharacters: [], // 存储已加载的角色名称
        loadedAnimations: [], // 存储已加载的动画名称
        
        charactersList: [
            {name: 'c1', path: '/models/characters/c1.fbx' },
            {name: 'c2', path: '/models/characters/c2.fbx' },
            {name: 'c3', path: '/models/characters/c3.fbx' },
            {name: 'c4', path: '/models/characters/c4.fbx' },
        ],
        animationsList: [
            { name: 'idle', path: '/models/animations/idle.fbx' },
            { name: 'back', path: '/models/animations/back.fbx' },
            { name: 'run', path: '/models/animations/run.fbx' }
        ]
    }),

    actions: {
        async loadAssets() {
            this.loading = true
            this.error = null
            const loader = new FBXLoader()

            try {
                // 加载角色模型
                for (const character of this.charactersList) {
                    try {
                        const fbx = await loader.loadAsync(
                            character.path,
                            () => {
                            }
                        )
                        // 存储到非响应式缓存中
                        modelCache.characters[character.name] = fbx
                        this.loadedCharacters.push(character.name)
                        console.log(`Loaded character: ${character.name}`)
                    } catch (err) {
                        console.error(`Error loading character ${character.name}:`, err)
                        this.error = `Failed to load character: ${character.name}`
                    }
                }

                // 加载动画
                for (const anim of this.animationsList) {
                    try {
                        const fbx = await loader.loadAsync(
                            anim.path,
                            () => {
                              
                            }
                        )
                        if (fbx.animations && fbx.animations.length > 0) {
                            // 存储到非响应式缓存中
                            modelCache.animations[anim.name] = fbx.animations[0]
                            this.loadedAnimations.push(anim.name)
                            console.log(`Loaded animation: ${anim.name}`)
                        }
                    } catch (err) {
                        console.error(`Error loading animation ${anim.name}:`, err)
                        this.error = `Failed to load animation: ${anim.name}`
                    }
                }

                this.loading = false
            } catch (err) {
                console.error('Asset loading failed:', err)
                this.error = 'Failed to load assets'
                this.loading = false
            }
        },

        // 获取角色模型
        getCharacter(name) {
            return modelCache.characters[name]
        },

        // 获取动画
        getAnimation(name) {
            return modelCache.animations[name]
        }
    }
}) 