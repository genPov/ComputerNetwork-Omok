loading = {
    start: function() {
        if (document.getElementById('wfLoading')) {
            return;
        }
        var ele = document.createElement('div');
        ele.setAttribute('id', 'wfLoading');
        ele.classList.add('loading-layer');
        ele.innerHTML = '<span class="loading-wrap"><span class="loading-text"><span>.</span><span>.</span><span>.</span><span>.</span></span></span>';
        document.body.append(ele);
    
        // Animation
        ele.classList.add('active-loading');
    },
    stop: function() {
        var ele = document.getElementById('wfLoading');
        if (ele) {
            ele.remove();
        }
    }
}