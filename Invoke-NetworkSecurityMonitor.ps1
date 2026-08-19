function Invoke-NetworkSecurityMonitor {
    param(
        [int]$DefenderLogCount = 20,
        [string]$AlertEmail = "",
        [string]$SmtpServer = "",
        [string]$WebhookUrl = ""
    )

    Write-Host "=== Network Security Monitor ===" -ForegroundColor Cyan
    $timestamp = Get-Date

    # 1. Windows Defender Logs
    Write-Host "`n[Defender Logs]" -ForegroundColor Yellow
    $defenderEvents = Get-WinEvent -LogName "Microsoft-Windows-Windows Defender/Operational" -MaxEvents $DefenderLogCount |
        Select-Object TimeCreated, Id, LevelDisplayName, Message
    $defenderEvents | Format-Table -AutoSize

    # Flag threats (Event ID 1116 = threat detected)
    $threats = $defenderEvents | Where-Object { $_.Id -eq 1116 }
    if ($threats) {
        Write-Host "!! Threats detected !!" -ForegroundColor Red
    }

    # 2. Network Device Checks
    Write-Host "`n[Active TCP Connections]" -ForegroundColor Yellow
    $connections = Get-NetTCPConnection | Select-Object LocalAddress, LocalPort, RemoteAddress, RemotePort, State
    $connections | Format-Table -AutoSize

    Write-Host "`n[ARP Table - Devices on LAN]" -ForegroundColor Yellow
    $arpTable = arp -a
    $arpTable

    # 3. Alerts
    $alertBody = @"
Security Monitor Report - $timestamp

Defender Threats:
$($threats | Out-String)

Active Connections:
$($connections | Out-String)

ARP Table:
$($arpTable | Out-String)
"@

    if ($AlertEmail -and $SmtpServer) {
        try {
            Send-MailMessage -To $AlertEmail -From "monitor@local" -Subject "Network Security Alert" -Body $alertBody -SmtpServer $SmtpServer
            Write-Host "Email alert sent to $AlertEmail" -ForegroundColor Green
        } catch {
            Write-Host "Failed to send email alert: $_" -ForegroundColor Red
        }
    }

    if ($WebhookUrl) {
        try {
            Invoke-RestMethod -Uri $WebhookUrl -Method Post -Body @{text=$alertBody}
            Write-Host "Webhook alert sent." -ForegroundColor Green
        } catch {
            Write-Host "Failed to send webhook alert: $_" -ForegroundColor Red
        }
    }

    Write-Host "`n=== Monitor Complete ===" -ForegroundColor Cyan
}