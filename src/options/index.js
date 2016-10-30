// Saves options to chrome.storage
function save_options() {
	var blockedUsers = document.getElementById('inputUsers').value.replace(/\s/g,'');
	var enableExtension = document.getElementById('enableExtension').checked;
	chrome.storage.sync.set({
		blockedUsers: blockedUsers,
		enableExtension: enableExtension
	}, function() {
		// Update status to let user know options were saved.
		var status = document.getElementById('status');
		status.textContent = 'Options saved.';
		setTimeout(function() {
			status.textContent = '';
		}, 750);
	});
}

// Restores select box and checkbox state using the preferences
// stored in chrome.storage.
function restore_options() {
	// Use default value blockedUsers = '' and enableExtension = true.
	chrome.storage.sync.get({
		blockedUsers: "",
		enableExtension: true
	}, function(items) {
		document.getElementById('inputUsers').value = items.blockedUsers;
		document.getElementById('enableExtension').checked = items.enableExtension;
	});
}
document.addEventListener('DOMContentLoaded', restore_options);
document.getElementById('save').addEventListener('click', save_options);