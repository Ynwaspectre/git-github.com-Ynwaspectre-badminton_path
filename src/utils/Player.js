import * as THREE from 'three'
const playerColors = [
    0x4287f5, // 蓝色
    0xf5d442, // 黄色
    0xff69b4, // 粉色
    0x808080  // 灰色
]
export class Player {
    constructor(scene, options = {}) {
        this.scene = scene
        this.position = options.position || { x: 0, y: 0, z: 0 }
        this.number = options.number || 1
        
        this.createPlayerMesh()
    }

    createPlayerMesh() {
        // 创建人物组
        this.mesh = new THREE.Group()
        // 根据玩家编号生成不同的颜色
        const playerColor = playerColors[(this.number - 1) % playerColors.length]
        
        // 创建身体部分
        const bodyGeometry = new THREE.CapsuleGeometry(0.3, 1, 4, 8)
        const bodyMaterial = new THREE.MeshPhongMaterial({ color: playerColor })
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial)
        body.position.y = 0.2
        
        // 创建头部
        const headGeometry = new THREE.SphereGeometry(0.25, 8, 8)
        const headMaterial = new THREE.MeshPhongMaterial({ color: playerColor })
        const head = new THREE.Mesh(headGeometry, headMaterial)
        head.position.y = 1.2

        // 添加眼睛
        const eyeGeometry = new THREE.SphereGeometry(0.08, 32, 32)  // 增大尺寸到0.26
        const eyeMaterial = new THREE.MeshPhongMaterial({ 
            color: 0x808080,  // 改为灰色
            shininess: 100    // 保持光泽度
        }) 
        
        // 左眼
        const leftEye = new THREE.Mesh(eyeGeometry, eyeMaterial)
        leftEye.position.set(0.15, 1.25, 0.14)  // 调整z轴，让眼睛更往里面
        
        // 右眼
        const rightEye = new THREE.Mesh(eyeGeometry, eyeMaterial)
        rightEye.position.set(-0.15, 1.25, 0.14)  // 调整z轴，让眼睛更往里面

        // 创建玩家编号标签
        const canvas = document.createElement('canvas')
        canvas.width = 256
        canvas.height = 256
        const context = canvas.getContext('2d')

        // 绘制更大的白色圆形背景
        context.beginPath()
        context.arc(128, 128, 100, 0, Math.PI * 2)  // 增大圆形半径从80到100
        context.fillStyle = 'white'
        context.fill()

        // 绘制更大的数字
        context.font = 'bold 160px Arial'  // 增大字体从120px到160px
        context.fillStyle = '#000000'
        context.textAlign = 'center'
        context.textBaseline = 'middle'
        context.fillText(this.number.toString(), 128, 128)

        const numberTexture = new THREE.CanvasTexture(canvas)
        const numberGeometry = new THREE.PlaneGeometry(0.5, 0.5)  // 增大平面从0.4到0.5
        const numberMaterial = new THREE.MeshBasicMaterial({
            map: numberTexture,
            transparent: true,
            side: THREE.DoubleSide
        })
        const numberMesh = new THREE.Mesh(numberGeometry, numberMaterial)
        numberMesh.position.y = 0.6  // 调整位置到身体中间偏上
        numberMesh.position.z = 0.31

        // 创建后视编号
        const numberMeshBack = numberMesh.clone()
        numberMeshBack.position.z = -0.31
        numberMeshBack.rotation.y = Math.PI

        // 添加所有部件到组中
        this.mesh.add(body)
        this.mesh.add(head)
        this.mesh.add(leftEye)  // 添加左眼
        this.mesh.add(rightEye) // 添加右眼
        this.mesh.add(numberMesh)
        this.mesh.add(numberMeshBack)
        
        // 设置位置和旋转
        this.mesh.position.set(this.position.x, 0, this.position.z)
        if (this.position.z > 0) {
            this.mesh.rotation.y = Math.PI
        }
        
        // 整体缩小模型
        this.mesh.scale.set(0.7, 0.7, 0.7)  // 将整个模型缩小到原来的70%

        this.scene.add(this.mesh)
    }



    dispose() {
        // 清理网格模型
        if (this.mesh && this.mesh.parent) {
            this.mesh.parent.remove(this.mesh)
        }
    }
} 