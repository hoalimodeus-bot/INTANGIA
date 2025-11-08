// Voice Control Functionality
document.addEventListener('DOMContentLoaded', function() {
    // Voice control elements
    const voiceBtn = document.getElementById('voice-control');
    const voicePanel = document.getElementById('voice-panel');
    const voiceToggle = document.getElementById('voice-toggle');
    const closeVoice = document.getElementById('close-voice');
    const voiceStatus = document.getElementById('voice-status-text');
    const voiceBars = document.querySelectorAll('.voice-visualizer .bar');
    
    // Modal elements
    const kycModal = document.getElementById('kyc-modal');
    const bankModal = document.getElementById('bank-modal');
    const startKycBtn = document.getElementById('start-kyc');
    const connectBankBtn = document.getElementById('connect-bank');
    const closeBtns = document.querySelectorAll('.close');
    
    // KYC elements
    const kycSteps = document.querySelectorAll('.kyc-steps .step');
    const nextStepBtns = document.querySelectorAll('.next-step');
    const prevStepBtns = document.querySelectorAll('.prev-step');
    const submitKycBtn = document.getElementById('submit-kyc');
    const closeKycBtn = document.getElementById('close-kyc');
    const idUpload = document.getElementById('id-upload');
    const idFile = document.getElementById('id-file');
    const cameraFeed = document.getElementById('camera-feed');
    const photoCanvas = document.getElementById('photo-canvas');
    const capturePhotoBtn = document.getElementById('capture-photo');
    
    // Bank connection elements
    const plaidConnectBtn = document.getElementById('plaid-connect');
    const manualBankForm = document.getElementById('manual-bank-form');
    
    // Voice control toggle
    voiceBtn.addEventListener('click', function() {
        voicePanel.style.display = 'block';
    });
    
    closeVoice.addEventListener('click', function() {
        voicePanel.style.display = 'none';
        if (annyang) {
            annyang.abort();
            voiceToggle.classList.remove('listening');
            voiceStatus.textContent = 'Click the microphone to start';
            resetVoiceBars();
        }
    });
    
    // Initialize voice commands if annyang is available
    if (annyang) {
        const commands = {
            'go to dashboard': function() {
                window.location.href = '/dashboard';
            },
            'create website': function() {
                window.location.href = '/website';
            },
            'add contact': function() {
                window.location.href = '/contacts';
            },
            'create invoice': function() {
                window.location.href = '/invoices';
            },
            'open settings': function() {
                window.location.href = '/settings';
            },
            'start kyc': function() {
                openModal(kycModal);
            },
            'connect bank': function() {
                openModal(bankModal);
            }
        };
        
        annyang.addCommands(commands);
        
        voiceToggle.addEventListener('click', function() {
            if (annyang.isListening()) {
                annyang.abort();
                voiceToggle.classList.remove('listening');
                voiceStatus.textContent = 'Click the microphone to start';
                resetVoiceBars();
            } else {
                annyang.start({ autoRestart: false, continuous: false });
                voiceToggle.classList.add('listening');
                voiceStatus.textContent = 'Listening...';
                animateVoiceBars();
            }
        });
        
        // Voice recognition events
        annyang.addCallback('start', function() {
            voiceStatus.textContent = 'Listening...';
            animateVoiceBars();
        });
        
        annyang.addCallback('end', function() {
            voiceToggle.classList.remove('listening');
            voiceStatus.textContent = 'Click the microphone to start';
            resetVoiceBars();
        });
        
        annyang.addCallback('result', function(phrases) {
            voiceStatus.textContent = `Heard: "${phrases[0]}"`;
            setTimeout(() => {
                voiceStatus.textContent = 'Click the microphone to start';
            }, 2000);
        });
    } else {
        voiceStatus.textContent = 'Voice control not supported in this browser';
        voiceToggle.disabled = true;
    }
    
    // Modal functionality
    startKycBtn.addEventListener('click', function() {
        openModal(kycModal);
    });
    
    connectBankBtn.addEventListener('click', function() {
        openModal(bankModal);
    });
    
    closeBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const modal = this.closest('.modal');
            closeModal(modal);
        });
    });
    
    // Close modal when clicking outside
    window.addEventListener('click', function(event) {
        if (event.target.classList.contains('modal')) {
            closeModal(event.target);
        }
    });
    
    // KYC step navigation
    nextStepBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const currentStep = this.closest('.step');
            const nextStepNum = this.getAttribute('data-next');
            const nextStep = document.querySelector(`.step[data-step="${nextStepNum}"]`);
            
            if (validateStep(currentStep)) {
                currentStep.classList.remove('active');
                nextStep.classList.add('active');
                
                // Initialize camera for step 3
                if (nextStepNum === '3') {
                    initializeCamera();
                }
            }
        });
    });
    
    prevStepBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const currentStep = this.closest('.step');
            const prevStepNum = this.getAttribute('data-prev');
            const prevStep = document.querySelector(`.step[data-step="${prevStepNum}"]`);
            
            currentStep.classList.remove('active');
            prevStep.classList.add('active');
        });
    });
    
    // ID upload
    idUpload.addEventListener('click', function() {
        idFile.click();
    });
    
    idFile.addEventListener('change', function() {
        if (this.files && this.files[0]) {
            idUpload.innerHTML = `<p>File selected: ${this.files[0].name}</p>`;
        }
    });
    
    // Capture photo
    capturePhotoBtn.addEventListener('click', function() {
        if (cameraFeed.srcObject) {
            const context = photoCanvas.getContext('2d');
            photoCanvas.width = cameraFeed.videoWidth;
            photoCanvas.height = cameraFeed.videoHeight;
            context.drawImage(cameraFeed, 0, 0);
            
            // Stop camera
            const stream = cameraFeed.srcObject;
            const tracks = stream.getTracks();
            tracks.forEach(track => track.stop());
            cameraFeed.srcObject = null;
            
            capturePhotoBtn.textContent = 'Photo Captured';
            capturePhotoBtn.disabled = true;
        }
    });
    
    // Submit KYC
    submitKycBtn.addEventListener('click', function() {
        // In a real app, you would send the data to your backend
        const currentStep = this.closest('.step');
        const nextStep = document.querySelector('.step[data-step="4"]');
        
        currentStep.classList.remove('active');
        nextStep.classList.add('active');
    });
    
    closeKycBtn.addEventListener('click', function() {
        closeModal(kycModal);
        // Reset KYC form
        kycSteps.forEach(step => step.classList.remove('active'));
        document.querySelector('.step[data-step="1"]').classList.add('active');
        document.getElementById('personal-info-form').reset();
        idUpload.innerHTML = '<p>Drag & drop your ID here or click to browse</p><input type="file" accept="image/*" id="id-file">';
        capturePhotoBtn.textContent = 'Take Photo';
        capturePhotoBtn.disabled = false;
    });
    
    // Bank connection
    plaidConnectBtn.addEventListener('click', function() {
        // In a real app, you would integrate with Plaid API
        alert('Plaid integration would be implemented here');
    });
    
    manualBankForm.addEventListener('submit', function(e) {
        e.preventDefault();
        // In a real app, you would send this data to your backend
        alert('Bank account details submitted');
        closeModal(bankModal);
    });
    
    // Helper functions
    function openModal(modal) {
        modal.style.display = 'flex';
    }
    
    function closeModal(modal) {
        modal.style.display = 'none';
    }
    
    function validateStep(step) {
        // Simple validation - in a real app, you would do more thorough validation
        const inputs = step.querySelectorAll('input[required]');
        let isValid = true;
        
        inputs.forEach(input => {
            if (!input.value.trim()) {
                isValid = false;
                input.style.borderColor = '#ef4444';
            } else {
                input.style.borderColor = '#d1d5db';
            }
        });
        
        if (!isValid) {
            alert('Please fill in all required fields');
        }
        
        return isValid;
    }
    
    function initializeCamera() {
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
            navigator.mediaDevices.getUserMedia({ video: true })
                .then(function(stream) {
                    cameraFeed.srcObject = stream;
                })
                .catch(function(error) {
                    console.error('Camera error:', error);
                    alert('Unable to access camera. Please ensure you have granted camera permissions.');
                });
        } else {
            alert('Your browser does not support camera access');
        }
    }
    
    function animateVoiceBars() {
        voiceBars.forEach(bar => {
            bar.style.height = Math.floor(Math.random() * 30 + 5) + 'px';
        });
        
        if (annyang.isListening()) {
            requestAnimationFrame(animateVoiceBars);
        }
    }
    
    function resetVoiceBars() {
        voiceBars.forEach(bar => {
            bar.style.height = '5px';
        });
    }
});