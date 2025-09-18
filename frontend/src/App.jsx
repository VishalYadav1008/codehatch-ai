// Folder toggle functionality
document.addEventListener('DOMContentLoaded', function() {
    const folders = document.querySelectorAll('.file-item.folder');
    folders.forEach(folder => {
        folder.addEventListener('click', function(e) {
            if (e.target !== this && !e.target.classList.contains('action-btn')) {
                return;
            }
            this.classList.toggle('open');
            const icon = this.querySelector('.file-icon i');
            if (this.classList.contains('open')) {
                icon.classList.remove('fa-folder');
                icon.classList.add('fa-folder-open');
            } else {
                icon.classList.remove('fa-folder-open');
                icon.classList.add('fa-folder');
            }
        });
    });
    
    // Tab switching functionality
    const tabs = document.querySelectorAll('.tab');
    tabs.forEach(tab => {
        tab.addEventListener('click', function() {
            tabs.forEach(t => t.classList.remove('active'));
            this.classList.add('active');
        });
    });
    
    // Login button functionality
    document.querySelector('.btn-primary').addEventListener('click', function() {
        alert('Login functionality would open here');
    });
    
    document.querySelector('.btn-secondary').addEventListener('click', function() {
        alert('Sign up functionality would open here');
    });
    
    document.querySelector('.login-btn').addEventListener('click', function() {
        alert('Login logic would execute here with backend API call');
    });
});