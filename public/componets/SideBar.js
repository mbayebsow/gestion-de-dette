document.getElementById("SideBar").innerHTML = `
    <div class="h-auto gap-5 grid">
        <button x-on:click="pageActive = 'dasboard'" :class="{'bg-red-500': pageActive === 'dasboard'}" class="cursor-pointer [border:none] p-3 bg-white rounded-full w-10 h-10">
            <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" fill="black" viewBox="0 0 24 24"><path d="M0 5.783v-2.783l4 4 5-6 9 7.878 6-3.922v2.437l-6.176 3.989-8.6-7.528-5.09 6.108-4.134-4.179zm18.909 7.279l-1.267.818-1.135-.994-7.058-6.177-3.778 4.534-1.41 1.692-1.548-1.566-2.713-2.743v14.374h24v-13.226l-5.091 3.288z"/></svg>
        </button>
        <button x-on:click="pageActive = 'dues'" :class="{'bg-red-500': pageActive === 'dues'}"  class="cursor-pointer [border:none] p-3 bg-white rounded-full w-10 h-10">
            <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24"><path d="M16 0l-3 9h9l-1.866 2h-14.4l10.266-11zm2.267 13h-14.4l-1.867 2h9l-3 9 10.267-11z"/></svg>
        </button>
        <button x-on:click="pageActive = 'clients'" :class="{'bg-red-500': pageActive === 'clients'}" class="cursor-pointer [border:none] p-3 bg-white rounded-full w-10 h-10">
            <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24"><path d="M10.118 16.064c2.293-.529 4.428-.993 3.394-2.945-3.146-5.942-.834-9.119 2.488-9.119 3.388 0 5.644 3.299 2.488 9.119-1.065 1.964 1.149 2.427 3.394 2.945 1.986.459 2.118 1.43 2.118 3.111l-.003.825h-15.994c0-2.196-.176-3.407 2.115-3.936zm-10.116 3.936h6.001c-.028-6.542 2.995-3.697 2.995-8.901 0-2.009-1.311-3.099-2.998-3.099-2.492 0-4.226 2.383-1.866 6.839.775 1.464-.825 1.812-2.545 2.209-1.49.344-1.589 1.072-1.589 2.333l.002.619z"/></svg>
        </button>
        </button>
        <button id="posSettingsHomeBtn" class="cursor-pointer [border:none] p-3 bg-white rounded-full w-10 h-10">
            <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24"><path d="M6 23.73l-3-2.122v-14.2l3 1.359v14.963zm2-14.855v15.125l13-1.954v-15.046l-13 1.875zm5.963-7.875c-2.097 0-3.958 2.005-3.962 4.266l-.001 1.683c0 .305.273.54.575.494.244-.037.425-.247.425-.494v-1.681c.003-1.71 1.416-3.268 2.963-3.268.537 0 1.016.195 1.384.564.422.423.654 1.035.653 1.727v1.747c0 .305.273.54.575.494.243-.037.423-.246.423-.492l.002-1.749c.002-1.904-1.32-3.291-3.037-3.291zm-6.39 5.995c.245-.037.427-.247.427-.495v-2.232c.002-1.71 1.416-3.268 2.963-3.268l.162.015c.366-.283.765-.513 1.188-.683-.405-.207-.858-.332-1.35-.332-2.096 0-3.958 2.005-3.962 4.266v2.235c0 .306.272.538.572.494z"/></svg>
        </button>
    </div>
`