---
description: Custom Domain limitations with LocalTunnel vs Cloudflare Tunnel
---

# Kendi Domainini Bağlama Rehberi (LocalTunnel vs Cloudflare)

Şu an **LocalTunnel** (Option 1) kullanıyorsunuz ve `better-flowers-care.loca.lt` gibi bir adres aldınız. Kendi özel domaininizi (örneğin `vniverse77.com`) bu sisteme bağlamak istiyorsanız bilmeniz gereken önemli teknik detaylar şunlardır:

## 1. LocalTunnel ile Kendi Domainini Kullanabilir miyim?
**Hayır, tam olarak değil.**
LocalTunnel'in ücretsiz versiyonu sadece `.loca.lt` uzantılı adresler verir.
*   **Yapabileceğiniz en iyi şey:** Sabit bir alt isim almaktır.
    ```bash
    npx localtunnel --port 3000 --subdomain vniverse77
    ```
    Bu size `https://vniverse77.loca.lt` adresini verir (eğer müsaitse).

*   **Neden `vniverse77.com` yapamıyorum?**
    DNS ayarlarınızdan `vniverse77.com` adresini `vniverse77.loca.lt` adresine yönlendirseniz (CNAME) bile, siteye girenler **"Güvenli Değil"** (SSL Hatası) uyarısı alır. Çünkü `loca.lt`'nin sertifikası sizin domaininiz için geçerli değildir.

## 2. Kendi Domainim ile "Laptop Sunucusu" İçin Çözüm Nedir?
Eğer mutlaka kendi domaininizi (`siteadi.com`) kullanmak istiyorsanız, **Cloudflare Tunnel (Option 2)** bu iş için **tek sorunsuz ve ücretsiz** çözümdür.

Cloudflare Tüneli:
1.  Size ait domaini (örn: `vniverse77.com`) kendi DNS'ine alır.
2.  Otomatik olarak **SSL Sertifikası** üretir (Güvenli kilit simgesi çıkar).
3.  Laptopunuzdaki 3000 portunu doğrudan `vniverse77.com`a bağlar.

### Özet Tavsiye
*   Eğer **`.loca.lt` uzantısı sorun değilse**:
    LocalTunnel kullanmaya devam edin ama sabit bir isim almak için şu komutu kullanın:
    ```bash
    npx localtunnel --port 3000 --subdomain isminiz
    ```

*   Eğer **mutlaka `vniverse77.com` (veya benzeri) olsun istiyorsanız**:
    Maalesef LocalTunnel'i bırakıp **Cloudflare Tunnel** kurulumuna geçmeniz gerekir. Cloudflare, domaininizi yönettiği için bu bağlantıyı güvenli bir şekilde yapabilen tek ücretsiz servistir.
