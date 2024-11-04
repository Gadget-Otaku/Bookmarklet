export default () => {
    const title = document.title;
    const url = document.URL;
    navigator.clipboard.javascript:(function() {    var url = window.location.href;    if (!url.endsWith('/quotes')) {        window.location.href = url + '/quotes';    }})();(`[${title}](${url})`).then();