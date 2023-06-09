// Once the DOM is ready...
window.addEventListener('DOMContentLoaded', async () => {

    // ...query for the active tab...
    chrome.tabs.query({
        active: true,
        currentWindow: true
    }, tabs => {
        const tab = tabs[0];
        // ...and send a request for the DOM info...
        if (tab.url.startsWith("https://app.clockify.me/tracker")) {
            chrome.tabs.sendMessage(
                tab.id,
                { from: 'popup', subject: 'get_clockify_report' },
                writeToPopup);
        } else {
            $("#app").html("Not clockify tracker site")
        }
    });

    restoreOptions();
    document.getElementById('settings-save').addEventListener('click', saveOptions);
    document.getElementById('send-button').addEventListener('click', sendToWebhook);
    document.getElementById('settings-btn').addEventListener('click', toggleSettings);

});
$(function () {
    $("#copy-button").on("click", copy);
})


function writeToPopup(info) {
    let link = uploadImage(info.img);
    $(".loading").hide();
    $(".content-wrap").show();
    $(".settings-wrap").show();
    $(".buttons-wrap").show();
    $(".entries").html(formatOutput(info.entries, link))
    window.clockify_report = { entries: info.entries, link }
};

function formatOutput(entries, link) {
    let output = "";

    let groups = entries.reduce(function (r, a) {
        r[a.client] = r[a.client] || [];
        r[a.client].push(a);
        return r;
    }, Object.create(null));


    Object.keys(groups).forEach((client) => {
        output += client;

        output += `<ul class="mb-0">`;
        groups[client].forEach(entry => {
            output += `<li> ${entry.title} \n </li>`
        });
        output += `</ul>`;
        output += '<br>';
    })
    output += `Clockify report: <span class="screenshot"> <a href="${link}" target="_blank">${link}</a> </screenshot>`;

    return output;
}

function uploadImage(img) {
    let link = "";
    let formData = new FormData();
    formData.append("image", img);
    formData.append("type", "base64");

    $.ajax({
        url: "https://api.imgur.com/3/image",
        type: "POST",
        datatype: "json",
        headers: {
            "Authorization": "Client-ID aca6d2502f5bfd8"
        },
        data: formData,
        success: function (response) {
            if (response.success) {
                link = response.data.link;
            }
        },
        cache: false,
        contentType: false,
        processData: false,
        async: false,
    });

    return link;
}

function copy() {
    const content = $(".content").html();
    const blob = new Blob([content], { type: 'text/html' });
    const clipboardItem = new window.ClipboardItem({ 'text/html': blob });
    navigator.clipboard.write([clipboardItem]).then(() => window.close());
}

function saveOptions() {
    const webhook_url = document.getElementById('webhook_url').value;
    handleSendButton()

    chrome.storage.sync.set(
        { webhook_url },
        () => {
            // Update status to let user know options were saved.
            const saveBtn = document.getElementById('settings-save');
            saveBtn.textContent = 'Saved';
            saveBtn.setAttribute("disabled", "");
            setTimeout(() => {
                saveBtn.textContent = 'Save';
                saveBtn.removeAttribute("disabled");
            }, 1000);
        }
    );
};

function restoreOptions() {
    chrome.storage.sync.get(
        { webhook_url: '' },
        (items) => {
            document.getElementById('webhook_url').value = items.webhook_url;
            handleSendButton()
        }
    );
};

function handleSendButton() {
    if (document.getElementById('webhook_url').value)
        document.getElementById('send-button').removeAttribute("disabled")
    else
        document.getElementById('send-button').setAttribute("disabled", "")
}

function sendToWebhook() {
    chrome.storage.sync.get(
        { webhook_url: '' },
        ({ webhook_url }) => {
            if (!webhook_url) return;
            $.ajax({
                url: webhook_url,
                type: "POST",
                contentType: 'application/json',
                data: JSON.stringify({
                    text: formatOutputForWebhook()
                }),
                success: function () {
                    window.close()
                },
            });
        }
    );

}

function formatOutputForWebhook() {
    let { entries, link } = window.clockify_report;
    let output = "Today's updates: \n\n"

    let groups = entries.reduce(function (r, a) {
        r[a.client] = r[a.client] || [];
        r[a.client].push(a);
        return r;
    }, Object.create(null));

    Object.keys(groups).forEach((client) => {
        output += client + ":\n"

        groups[client].forEach(entry => {
            output += `• ${entry.title} \n`
        })

        output += "\n"
    })

    output += link;
    // output += `\n\n`;

    return output;
}

function toggleSettings() {
    $(".settings").toggleClass("d-none")
    $(".content-wrap").toggleClass("d-none")
    $(".buttons-wrap").toggleClass("d-none")
}