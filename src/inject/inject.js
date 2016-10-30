chrome.extension.sendMessage({}, function(response) {
	var readyStateCheckInterval = setInterval(function() {
	if (document.readyState === "complete") {
		clearInterval(readyStateCheckInterval);

		blockedUsers = [];
		enableExtension = false;

		var should_hide_message = function(message){
			return Boolean(blockedUsers.indexOf(message.getAttribute('data-member-id')) > -1)
		}
		var hide_message = function(message){
			message.style.display = "none";
		}
		var handle_message = function(message){
			if (should_hide_message(message)){
				hide_message(message)
			}
		}

		message_div = $('#msgs_div')  // Parent div that contains messages

		chrome.storage.sync.get({
			blockedUsers: "",
			enableExtension: true
		}, function(items) {
			blockedUsers = items.blockedUsers.split(',');
			enableExtension = items.enableExtension;

			if (enableExtension == false){
				return
			}

			// Add function to be called everytime a new node is inserted
			message_div.bind('DOMNodeInserted', function(event){
				event_target = event.target;

				// Handle new incoming messages
				if (event_target.tagName == "TS-MESSAGE"){
					handle_message(event_target)
				} 

				// Handle message history loading
				else if (event_target.className == 'day_container'){
					messages = event_target.getElementsByTagName('ts-message')
					for (i=0; i<messages.length; i++){
						handle_message(messages[i])
					}
				}

			})
		});
	}
	}, 10);
});