const tableDefinitions = {
    kameraTable: ["adet", "marka", "model", "cozunurluk"],
    isIstasyonuTable: ["adet", "sistemUreticisi", "cpu", "gpu", "ram"]
};

function addTableRow(tableId) {
    const table = document.getElementById(tableId);
    const row = table.tBodies[0].insertRow();
    tableDefinitions[tableId].forEach((field) => {
        const cell = row.insertCell();
        const input = document.createElement("input");
        input.type = field === "adet" ? "number" : "text";
        input.min = field === "adet" ? "0" : "";
        input.dataset.field = field;
        cell.appendChild(input);
    });
    const actionCell = row.insertCell();
    const removeButton = document.createElement("button");
    removeButton.type = "button";
    removeButton.className = "remove";
    removeButton.textContent = "Sil";
    removeButton.addEventListener("click", () => row.remove());
    actionCell.appendChild(removeButton);
}

function collectTable(tableId) {
    return [...document.getElementById(tableId).tBodies[0].rows].map((row) => {
        const item = {};
        row.querySelectorAll("input").forEach((input) => {
            item[input.dataset.field] = input.value;
        });
        return item;
    });
}

function value(form, name) {
    return form.elements[name]?.value || "";
}

function formatDate(value) {
    const dateParts = value.includes("/") ? value.split("/") : value.split("-").reverse();
    const [day, month, year] = dateParts;
    return day && month && year ? `${day}/${month}/${year}` : "";
}

function checkedValues(form, name) {
    return [...form.querySelectorAll(`input[name="${name}"]:checked`)].map((input) => input.value);
}

function jsonOlustur(event) {
    event.preventDefault();
    const form = event.currentTarget;
    const veri = {
        genelBilgiler: {
            kesifTarihi: formatDate(value(form, "kesifTarihi")),
            tesisAdi: value(form, "tesisAdi"),
            kesfiYapan: value(form, "kesfiYapan"),
            tesisYetkilisi: value(form, "tesisYetkilisi"),
            yetkiliTelefon: value(form, "yetkiliTelefon"),
            yetkiliEposta: value(form, "yetkiliEposta")
        },
        videoIzleme: {
            toplamKameraSayisi: value(form, "toplamKameraSayisi"),
            kameralar: collectTable("kameraTable"),
            nvr: value(form, "nvr"),
            dvrXvr: value(form, "dvrXvr"),
            kanalKapasitesi: value(form, "kanalKapasitesi"),
            depolamaKapasitesi: value(form, "depolamaKapasitesi"),
            raidTipi: value(form, "raidTipi"),
            isIstasyonlari: collectTable("isIstasyonuTable"),
            vmsYazilimi: value(form, "vmsYazilimi")
        },
        agAltyapisi: {
            yonetilebilirSwitch: value(form, "yonetilebilirSwitch"),
            yonetilemezSwitch: value(form, "yonetilemezSwitch"),
            bosPortSayisi: value(form, "bosPortSayisi"),
            kablolama: checkedValues(form, "kablolama")
        },
        yanginAlarm: {
            yanginPaneli: value(form, "yanginPaneli"),
            panelSistemTipi: value(form, "panelSistemTipi"),
            dumanDedektoru: value(form, "dumanDedektoru"),
            isiDedektoru: value(form, "isiDedektoru"),
            ihbarButonu: value(form, "ihbarButonu"),
            siren: value(form, "siren"),
            entegrasyon: value(form, "yanginEntegrasyon")
        },
        gecisKontrol: {
            marka: value(form, "gecisMarkasi"),
            kartliOkuyucu: value(form, "kartliOkuyucu"),
            biyometrikOkuyucu: value(form, "biyometrikOkuyucu"),
            gecisNoktasi: value(form, "gecisNoktasi"),
            entegrasyon: value(form, "gecisEntegrasyon")
        },
        asansor: {
            markaModel: value(form, "asansorMarkasi"),
            sayi: value(form, "asansorSayisi"),
            teknoloji: value(form, "asansorTeknolojisi"),
            kamera: value(form, "asansorKamera"),
            acilDiyafon: value(form, "acilDiyafon")
        },
        ups: { markaModel: value(form, "upsMarkasi"), kapasite: value(form, "upsKapasitesi"), akuBilgisi: value(form, "akuBilgisi") },
        internet: { saglayici: value(form, "internetSaglayicisi"), downloadMbps: value(form, "download"), uploadMbps: value(form, "upload"), statikIp: value(form, "statikIp") },
        ekBilgiler: value(form, "ekBilgiler")
    };
    localStorage.setItem("kesifVerisi", JSON.stringify(veri));
    window.open("sonuc.html", "_blank");
}

document.querySelectorAll(".add").forEach((button) => {
    button.addEventListener("click", () => addTableRow(button.dataset.table));
});

const kesifForm = document.getElementById("kesifForm");
if (kesifForm) {
    kesifForm.addEventListener("submit", jsonOlustur);
    addTableRow("kameraTable");
    addTableRow("isIstasyonuTable");
}

const jsonCikti = document.getElementById("jsonCikti");
if (jsonCikti) {
    const kayit = localStorage.getItem("kesifVerisi");
    jsonCikti.textContent = kayit ? JSON.stringify(JSON.parse(kayit), null, 2) : "Henüz oluşturulmuş bir keşif verisi yok.";
    document.getElementById("kopyala")?.addEventListener("click", async () => {
        await navigator.clipboard.writeText(jsonCikti.textContent);
        document.getElementById("durum").textContent = "JSON panoya kopyalandı.";
    });
    document.getElementById("indir")?.addEventListener("click", () => {
        const blob = new Blob([jsonCikti.textContent], { type: "application/json" });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = "tesis-guvenlik-kesif.json";
        link.click();
        URL.revokeObjectURL(link.href);
    });
}