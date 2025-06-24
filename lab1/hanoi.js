// Компонент для анімації переміщення кілець
AFRAME.registerComponent('ring-mover', {
    schema: {
        delay: {type: 'number', default: 0},
        targetPosition: {type: 'vec3'},
        duration: {type: 'number', default: 2000}
    },
    init: function() {
        const el = this.el;
        const data = this.data;
        
        setTimeout(() => {
            // Анімація підйому
            el.setAttribute('animation__up', {
                property: 'position',
                to: `${el.object3D.position.x} 6 ${el.object3D.position.z}`,
                dur: data.duration / 3,
                easing: 'easeInOutQuad'
            });
            
            // Анімація переміщення по горизонталі
            setTimeout(() => {
                el.setAttribute('animation__move', {
                    property: 'position',
                    to: `${data.targetPosition.x} 6 ${data.targetPosition.z}`,
                    dur: data.duration / 3,
                    easing: 'easeInOutQuad'
                });
            }, data.duration / 3);
            
            // Анімація опускання
            setTimeout(() => {
                el.setAttribute('animation__down', {
                    property: 'position',
                    to: data.targetPosition,
                    dur: data.duration / 3,
                    easing: 'easeInOutQuad'
                });
            }, (data.duration * 2) / 3);
        }, data.delay);
    }
});

// Компонент для реєстрації подій маркера (AR.js)
AFRAME.registerComponent('marker-events', {
    init: function () {
        var marker = this.el;
        var hanoiTowers = document.querySelector('#hanoiTowersGroup');
        
        marker.addEventListener('markerFound', function() {
            console.log('Маркер знайдено');
            // Прибираємо завантажувач при знаходженні маркера
            var loader = document.querySelector('.arjs-loader');
            if (loader) {
                loader.style.display = 'none';
            }
            // Показуємо вежі
            if (hanoiTowers) {
                hanoiTowers.setAttribute('visible', 'true');
            }
        });
        
        marker.addEventListener('markerLost', function() {
            console.log('Маркер втрачено');
            // Ховаємо вежі
            if (hanoiTowers) {
                hanoiTowers.setAttribute('visible', 'false');
            }
        });
    }
});

// Компонент для стабілізації MindAR
AFRAME.registerComponent('smoothing', {
    schema: {
        smoothing: { type: 'number', default: 0.8 },
        movementThreshold: { type: 'number', default: 0.003 },
        rotationThreshold: { type: 'number', default: 0.1 }
    },
    
    init: function() {
        this.visibleStarted = false;
        this.lastPosition = new THREE.Vector3();
        this.lastQuaternion = new THREE.Quaternion();
        this.targetPosition = new THREE.Vector3();
        this.targetQuaternion = new THREE.Quaternion();
        
        this.el.addEventListener('targetFound', () => {
            this.visibleStarted = true;
            this.lastPosition.copy(this.el.object3D.position);
            this.lastQuaternion.copy(this.el.object3D.quaternion);
            
            // Прибираємо завантажувач
            var loader = document.querySelector('.arjs-loader');
            if (loader) {
                loader.style.display = 'none';
            }
        });
        
        this.el.addEventListener('targetLost', () => {
            this.visibleStarted = false;
        });
    },
    
    tick: function() {
        if (!this.visibleStarted) return;
        
        this.targetPosition.copy(this.el.object3D.position);
        this.targetQuaternion.copy(this.el.object3D.quaternion);
        
        const movementDistance = this.lastPosition.distanceTo(this.targetPosition);
        const isMoving = movementDistance > this.data.movementThreshold;
        
        const rotationDiff = Math.abs(
            this.lastQuaternion.angleTo(this.targetQuaternion) * 180 / Math.PI
        );
        const isRotating = rotationDiff > this.data.rotationThreshold;
        
        if (!isMoving && !isRotating) return;
        
        this.el.object3D.position.lerp(this.lastPosition, this.data.smoothing);
        this.el.object3D.quaternion.slerp(this.lastQuaternion, this.data.smoothing);
        
        if (isMoving) {
            this.lastPosition.lerp(this.targetPosition, 1 - this.data.smoothing);
        }
        
        if (isRotating) {
            this.lastQuaternion.slerp(this.targetQuaternion, 1 - this.data.smoothing);
        }
    }
});

// Функція для створення HTML структури Ханойських веж
function createHanoiTowersHTML() {
    return `
        <!-- Основа -->
        <a-box position="0 0 0" width="10" height="0.5" depth="3" color="#8B4513" 
               shadow="receive: true">
            <a-box position="0 0.26 0" width="10.2" height="0.1" depth="3.2" color="#654321"></a-box>
        </a-box>

        <!-- Стрижні -->
        <!-- Лівий стрижень -->
        <a-cylinder position="-3 2 0" radius="0.15" height="4" color="#2c2c2c" shadow></a-cylinder>
        <a-cylinder position="-3 0.3 0" radius="0.5" height="0.1" color="#1a1a1a"></a-cylinder>
        
        <!-- Середній стрижень -->
        <a-cylinder position="0 2 0" radius="0.15" height="4" color="#2c2c2c" shadow></a-cylinder>
        <a-cylinder position="0 0.3 0" radius="0.5" height="0.1" color="#1a1a1a"></a-cylinder>
        
        <!-- Правий стрижень -->
        <a-cylinder position="3 2 0" radius="0.15" height="4" color="#2c2c2c" shadow></a-cylinder>
        <a-cylinder position="3 0.3 0" radius="0.5" height="0.1" color="#1a1a1a"></a-cylinder>

        <!-- Кільця (від найбільшого до найменшого) -->
        <!-- Кільце 7 - Червоне - НЕПАРНЕ → правий стрижень (четверте, найвище) -->
        <a-torus id="ring7" position="-3 0.45 0" color="#FF0000" radius="1.4" radius-tubular="0.15" 
                 segments-radial="16" segments-tubular="32" shadow
                 rotation="90 0 0"
                 ring-mover="delay: 12000; targetPosition: 3 1.95 0; duration: 3000">
        </a-torus>

        <!-- Кільце 6 - Помаранчеве - ПАРНЕ -->
        <a-torus id="ring6" position="-3 0.75 0" color="#FF8C00" radius="1.2" radius-tubular="0.15" 
                 segments-radial="16" segments-tubular="32" shadow
                 rotation="90 0 0"
                 ring-mover="delay: 10000; targetPosition: 0 1.45 0; duration: 3000">
        </a-torus>

        <!-- Кільце 5 - Жовте - НЕПАРНЕ → правий стрижень (третє) -->
        <a-torus id="ring5" position="-3 1.05 0" color="#FFD700" radius="1.0" radius-tubular="0.15" 
                 segments-radial="16" segments-tubular="32" shadow
                 rotation="90 0 0"
                 ring-mover="delay: 8000; targetPosition: 3 1.45 0; duration: 3000">
        </a-torus>

        <!-- Кільце 4 - Зелене - ПАРНЕ -->
        <a-torus id="ring4" position="-3 1.35 0" color="#00FF00" radius="0.8" radius-tubular="0.15" 
                 segments-radial="16" segments-tubular="32" shadow
                 rotation="90 0 0"
                 ring-mover="delay: 6000; targetPosition: 0 0.95 0; duration: 3000">
        </a-torus>

        <!-- Кільце 3 - Блакитне - НЕПАРНЕ → правий стрижень (друге) -->
        <a-torus id="ring3" position="-3 1.65 0" color="#00CED1" radius="0.6" radius-tubular="0.15" 
                 segments-radial="16" segments-tubular="32" shadow
                 rotation="90 0 0"
                 ring-mover="delay: 4000; targetPosition: 3 0.95 0; duration: 3000">
        </a-torus>

        <!-- Кільце 2 - Синє - ПАРНЕ → середній стрижень -->
        <a-torus id="ring2" position="-3 1.95 0" color="#0000FF" radius="0.4" radius-tubular="0.15" 
                 segments-radial="16" segments-tubular="32" shadow
                 rotation="90 0 0"
                 ring-mover="delay: 2000; targetPosition: 0 0.45 0; duration: 3000">
        </a-torus>

        <!-- Кільце 1 (найменше) - Фіолетове - НЕПАРНЕ → правий стрижень -->
        <a-torus id="ring1" position="-3 2.25 0" color="#8B008B" radius="0.25" radius-tubular="0.15" 
                 segments-radial="16" segments-tubular="32" shadow
                 rotation="90 0 0"
                 ring-mover="delay: 0; targetPosition: 3 0.45 0; duration: 3000">
        </a-torus>
    `;
}
