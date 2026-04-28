from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
import time

driver = webdriver.Chrome()
driver.maximize_window()

driver.get("https://demoqa.com/text-box")

full_name = driver.find_element(By.ID, "userName")
email = driver.find_element(By.ID, "userEmail")
current_address = driver.find_element(By.ID, "currentAddress")
permanent_address = driver.find_element(By.ID, "permanentAddress")

full_name.send_keys("eg_name")
email.send_keys("xyz@test.com")
current_address.send_keys("anycity")
permanent_address.send_keys("Any_city")

submit_btn = driver.find_element(By.ID, "submit")
driver.execute_script("arguments[0].click();", submit_btn)

time.sleep(2)

output_name = driver.find_element(By.ID, "name").text
output_email = driver.find_element(By.ID, "email").text

print("OUTPUT NAME:", output_name)
print("OUTPUT EMAIL:", output_email)

driver.get("https://www.daiict.ac.in")
print("TITLE:", driver.title)
driver.quit()

