chrome.extension.sendMessage({}, function(response) {
	var readyStateCheckInterval = setInterval(function() {
	if (document.readyState === "complete") {
		clearInterval(readyStateCheckInterval);

		blockedUsers = [];
		onlyBlockDMs = false;
		enableExtension = false;

		var is_dm_window = function(){
			var channel_title_div = $('#channel_title')[0]
			return channel_title_div == undefined  // DMs do not have a DOM element with this ID
		}

		var should_hide_message = function(message){
			var senderId = message.getAttribute('data-member-id')
			if (senderId == ""){
				senderId = message.getAttribute('data-bot-id')	
			}

			return Boolean(blockedUsers.indexOf(senderId) > -1)
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
			onlyBlockDMs: false,
			enableExtension: true
		}, function(items) {
			blockedUsers = items.blockedUsers.split(',');
			onlyBlockDMs = items.onlyBlockDMs;
			enableExtension = items.enableExtension;

			if (enableExtension == false){
				return
			}

			// Add function to be called everytime a new node is inserted in message_div
			message_div.bind('DOMNodeInserted', function(event){
				if (onlyBlockDMs && !is_dm_window()) {
					return
				}

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