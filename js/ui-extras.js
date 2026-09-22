  (function(){
    // 1) Sincroniza o tema (claro/escuro) com o <html>, que é onde o CSS novo procura a classe "light".
    //    O script original só marca o <body>; aqui apenas espelhamos esse estado no elemento <html>.
    function syncThemeToHtml(){
      var isLight = document.body.getAttribute("data-theme") === "light";
      document.documentElement.classList.toggle("light", isLight);
      document.documentElement.classList.toggle("dark", !isLight);
      document.documentElement.setAttribute("data-theme", isLight ? "light" : "dark");
    }
    syncThemeToHtml();
    new MutationObserver(syncThemeToHtml).observe(document.body, { attributes: true, attributeFilter: ["data-theme"] });

    // 2) Permite trocar a foto do usuário (avatar do header) e guarda no localStorage do navegador.
    var AVATAR_KEY = "PF_USER_AVATAR_V1";
    var img = document.getElementById("userAvatarImg");
    var input = document.getElementById("avatarInput");
    try{
      var saved = localStorage.getItem(AVATAR_KEY);
      if(saved && img) img.src = saved;
    }catch(e){}
    if(input){
      input.addEventListener("change", function(){
        var file = input.files && input.files[0];
        if(!file) return;
        var reader = new FileReader();
        reader.onload = function(){
          if(img) img.src = reader.result;
          try{ localStorage.setItem(AVATAR_KEY, reader.result); }catch(e){}
        };
        reader.readAsDataURL(file);
      });
    }
  })();
