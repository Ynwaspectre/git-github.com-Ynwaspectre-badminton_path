import { defineStore } from 'pinia'
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader'

export const useAssetsStore = defineStore('assets', {
    state: () => ({
        // 加载状态
        loading: true,
        progress: 0,
        error: null,
        
        // 存储加载的资源
        characters: {},  // 角色模型
        animations: {},  // 动画
        
        // 资源列表
        charactersList: [
            { id:'c1', name: 'amy', path: '/static/characters/c1.fbx' },
            { id:'c2', name: 'john', path: '/static/characters/c2.fbx' }
        ],
        animationsList: [
            { name: 'idle', path: '/static/animations/idle.fbx' },
            { name: 'back', path: '/static/animations/back.fbx' },
            { name: 'forward', path: '/static/animations/forward.fbx' }
            // 添加其他动画...
        ]
    }),

    actions: {
        async loadAssets() {
            this.loading = true
            this.progress = 0
            this.error = null
            
            const loader = new FBXLoader()
            const totalAssets = this.charactersList.length + this.animationsList.length
            let loadedAssets = 0

            try {
                // 加载角色模型
                for (const character of this.charactersList) {
                    try {
                        const fbx = await loader.loadAsync(character.path)
                        this.characters[character.name] = fbx
                        loadedAssets++
                        this.progress = (loadedAssets / totalAssets) * 100
                        console.log(`Loaded character: ${character.name}`)
                    } catch (err) {
                        console.error(`Error loading character ${character.name}:`, err)
                        this.error = `Failed to load character: ${character.name}`
                    }
                }

                // 加载动画
                for (const anim of this.animationsList) {
                    try {
                        const fbx = await loader.loadAsync(anim.path)
                        if (fbx.animations && fbx.animations.length > 0) {
                            this.animations[anim.name] = fbx.animations[0]
                            console.log(`Loaded animation: ${anim.name}`)
                        } else {
                            console.warn(`No animations found in file: ${anim.path}`)
                        }
                        loadedAssets++
                        this.progress = (loadedAssets / totalAssets) * 100
                    } catch (err) {
                        console.error(`Error loading animation ${anim.name}:`, err)
                        this.error = `Failed to load animation: ${anim.name}`
                    }
                }

                console.log('All assets loaded successfully')
                this.loading = false
            } catch (err) {
                console.error('Asset loading failed:', err)
                this.error = 'Failed to load assets'
                this.loading = false
            }
        },

        // 获取角色模型
        getCharacter(name) {
            return this.characters[name]
        },

        // 获取动画
        getAnimation(name) {
            return this.animations[name]
        }
    }
}) 