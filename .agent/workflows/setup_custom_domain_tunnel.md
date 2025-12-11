---
description: Step-by-step guide to setting up a Named Cloudflare Tunnel for a Custom Domain
---

# Cloudflare Named Tunnel (Özel Domain) Kurulum Rehberi

Kendi domaininizi (örn: `vniverse77.com`) kullanarak bir tünel oluşturmak için aşağıdaki adımları sırasıyla uygulayın.

## Ön Hazırlık
1.  Bir **Cloudflare** hesabınız olmalı.
2.  Domaininiz (alan adınız) Cloudflare'e eklenmiş ve nameserver'ları Cloudflare'e yönlendirilmiş olmalı.

---

## Adım 1: Giriş Yapın
Terminalde şu komutu çalıştırarak Cloudflare hesabınıza yetki verin. Bu komut size bir link verecek, o linke tıklayıp domaininizi seçin.
```bash
cloudflared tunnel login
```
*(Bu işlemden sonra bilgisayarınıza `cert.pem` adında bir yetki dosyası indirilecektir).*

## Adım 2: Tünel Oluşturun
Tünelinize bir isim verin (Örneğin: `laptop-server`).
```bash
cloudflared tunnel create laptop-server
```
*Bu komut size bir **Tunnel ID** verecek. Çıktıyı kaydedin veya not edin.*

## Adım 3: Domain Yönlendirmesi (DNS)
Tüneli hangi adreste çalıştırmak istiyorsunuz? (Örn: `www.vniverse77.com` veya `demo.vniverse77.com`).
```bash
cloudflared tunnel route dns laptop-server demo.alanadiniz.com
```

## Adım 4: Konfigürasyon Dosyası
Cloudflare'in trafiği nereye yönlendireceğini bilmesi için bir ayar dosyası oluşturmalıyız.

1.  Kullanıcı klasörünüzde `.cloudflared` klasörüne girin (veya oluşturun).
2.  `config.yml` adında bir dosya oluşturun ve içine şunları yazın:

```yaml
tunnel: <TUNNEL-ID-BURAYA>
credentials-file: /home/vniverse77/.cloudflared/<TUNNEL-ID-BURAYA>.json

ingress:
  - hostname: demo.alanadiniz.com
    service: http://localhost:3000
  - service: http_status:404
```
*(Not: `<TUNNEL-ID-BURAYA>` kısımlarını Adım 2'de aldığınız ID ile, `demo.alanadiniz.com` kısmını da kendi domaininizle değiştirin).*

## Adım 5: Tüneli Başlatın
Artık tüneli kalıcı isminizle başlatabilirsiniz:
```bash
cloudflared tunnel run laptop-server
```

---
### (Opsiyonel) Arka Planda Kalıcı Olarak Çalıştırma
Bilgisayar her açıldığında otomatik çalışsın isterseniz:
```bash
sudo cloudflared service install
sudo systemctl start cloudflared
```
