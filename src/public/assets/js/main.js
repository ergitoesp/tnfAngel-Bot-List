function c(name) {
    var match = document.cookie.match(new RegExp("(^| )" + name + "=([^;]+)"));
    if (match) return match[2];
}

String.prototype.replaceAll = function (search, replacement) {
    var target = this;
    return target.split(search).join(replacement);
};

function responsive() {
    if (document.body.offsetWidth < 768) {
        console.log("Optimizando vista para pantallas pequeñas..");
        if (document.getElementById("searchimg"))
            document.getElementById("searchimg").style.display = "none";

        if (document.getElementById("search")) {
            document.getElementById("search").parentElement.href = "/search/";
            document.getElementById("search").contentEditable = "false";
            document.getElementById("search").innerHTML = "Search";
        }

        if (document.getElementsByClassName("active-navtext").length === 0) return;
        document.getElementsByClassName("active-navtext")[0].style.display = "none";
        let x = document.getElementsByClassName("active-navtext")[0].parentElement
            .parentElement;
        if (x.children[3]) x.children[3].style.display = "none";
        if (x.children[6]) x.children[6].style.display = "none";
    } else {
        console.log("Optimizando vista para pantallas grandes...");
        if (document.getElementById("searchimg"))
            document.getElementById("searchimg").style.display = "inline";
        if (document.getElementById("searchlink"))
            document.getElementById("searchlink").style.display = "none";
    }
}

$(window).scroll(function () {
    var header = document.getElementById("navTop");
    var elemRect = header.getBoundingClientRect();
    if (elemRect.top <= 0) stickify(header);
    if ($(window).scrollTop() === 0) unstickify(header);
});

function stickify(something) {
    something.style.width = "100%";
    something.style.position = "fixed";
    something.style.margin = "0";
    something.style.boxShadow = "0 4px 4px -4px #888888";

    if (document.getElementsByClassName("dd-content")[0])
        document.getElementsByClassName(
            "dd-content"
        )[0].style.boxShadow = `0px 4px 4px -4px rgb(136, 136, 136), -4px 0 4px -4px rgb(136, 136, 136)`;
}

function unstickify(something) {
    something.style.width = "calc(100% - 100px)";
    something.style.position = "absolute";
    something.style.margin = "30px 50px";
    something.style.boxShadow = "0 0 0 0 #888888";

    if (document.body.offsetWidth < 768) {
        something.style.width = "calc(100% - 20px)";
        something.style.margin = "30px 10px";
    }

    document.getElementsByClassName(
        "dd-content"
    )[0].style.boxShadow = `0 0 0 0 #fff`;
}

window.onresize = function () {
    responsive();
};

$(document).ready(function () {
    responsive();    
    let login = document.getElementById("login");
    if (login.innerText == "Login") return;
    login.href = `/me`;

    let w = login.getBoundingClientRect().width;

    if (document.getElementById("search"))
        document.getElementById("search").style.right = `${w - 50}px`;
    if (document.getElementById("searchimg"))
        document.getElementById("searchimg").style.right = `${w - 50}px`;
    if (document.getElementsByClassName("dropdown")[0]) {
        document.getElementsByClassName("dropdown")[0].onmouseover = () =>
            (document.getElementsByClassName("dd-content")[0].style.display =
                "block");
        document.getElementsByClassName("dropdown")[0].onmouseout = () =>
            (document.getElementsByClassName("dd-content")[0].style.display = "none");
    }
});

$('a[href^="#"]').on("click", function (event) {
    var target = $(this.getAttribute("href"));
    if (target.length) {
        event.preventDefault();
        $("html, body")
            .stop()
            .animate({
                    scrollTop: target.offset().top
                },
                1500
            );
    }
});