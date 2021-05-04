<?php


class EventModel
{
    private $_address;

    public function __construct()
    {
        $this->setAddress($_SERVER['REMOTE_ADDR']);
    }

    private function setAddress($address)
    {
        $this->_address = $address;
    }

    private function getAddress()
    {
        return $this->_address;
    }

    private function isBot()
    {

        if (isset($_SERVER['HTTP_USER_AGENT'])) {
            return preg_match('/rambler|abacho|acoi|accona|aspseek|altavista|estyle|scrubby|lycos|geona|ia_archiver|alexa|sogou|skype|facebook|twitter|pinterest|linkedin|naver|bing|google|yahoo|duckduckgo|yandex|baidu|teoma|xing|java\/1.7.0_45|bot|crawl|slurp|spider|mediapartners|\sask\s|\saol\s/i', $_SERVER['HTTP_USER_AGENT']);
        }
        return false;
    }

    public function addEvent($name)
    {
        if (!$this->isBot()) {
            include RELATIVE_PATH['database'] . 'connection.php';
            $query = $db->prepare("INSERT INTO " . $db_prefix . "events(date,address,event)
					   VALUES (NOW(),?,?)");
            $query->execute([
                $this->getAddress(),
                $name
            ]);
        }
    }

    public function cleanEventLogs($lastDays)
    {
        include RELATIVE_PATH['database'] . 'connectionStats.php';
        $query = $db->prepare("DELETE FROM " . $db_prefix . "events
                               WHERE date < NOW() - INTERVAL ? DAY");
        $query->execute([
            $lastDays
        ]);
    }
}