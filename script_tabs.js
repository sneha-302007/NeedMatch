function showSteps(type) {
    // Toggle active tab style
    document.querySelectorAll('.tab').forEach(tab => tab.classList.remove('active'));
    document.querySelector(`.tab:nth-child(${type === 'donor' ? 1 : 2})`).classList.add('active');

    // Show correct steps
    document.getElementById('donorSteps').style.display = type === 'donor' ? 'flex' : 'none';
    document.getElementById('ngoSteps').style.display = type === 'ngo' ? 'flex' : 'none';

    // Show correct button
    document.getElementById('donorBtn').style.display = type === 'donor' ? 'block' : 'none';
    document.getElementById('ngoBtn').style.display = type === 'ngo' ? 'block' : 'none';
}