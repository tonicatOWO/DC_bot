import json
import os
import discord
from discord.ui import Modal, TextInput, View, Button
#=======================================================
data_path = "registered_students.json"  # 填寫路徑
def load_data(file_path):
	if os.path.exists(file_path):
		with open(file_path, 'r', encoding="UTF-8") as file:
			return json.load(file)
	return {"students": []}  

def save_data(file_path, data):
	with open(file_path, 'w', encoding="UTF-8") as file:
		json.dump(data, file, indent=4)
#=======================================================
class signup(Modal):

	def __init__(self):
		super().__init__(title="驗證資料")
		self.student_id_input = TextInput(label="學號", placeholder="請輸入你的學號")
		self.student_name_input = TextInput(label="姓名", placeholder="請輸入你的姓名")
		self.add_item(self.student_id_input)
		self.add_item(self.student_name_input)

	async def on_submit(self, interaction: discord.Interaction):
		student_id = self.student_id_input.value
		student_name = self.student_name_input.value
		print(f"Received student_id: {student_id}, student_name: {student_name}")  # Debug信息會印再terminal
		data = load_data(data_path)
		for student in data["students"]:
			if student["id"] == student_id and student["name"] == student_name:
				student["registered"] = True
				student["discord_id"] = interaction.user.mention
				save_data(data_path, data)
				embed = discord.Embed(title="資研社簽到機器人", color=discord.Color.green())
				embed.add_field(name="驗證成功", value="已成功註冊", inline=False)
				embed.add_field(name="歡迎", value=f"{interaction.user.mention} 同學", inline=False)
				embed.set_thumbnail(url="https://hackmd.io/_uploads/H1M_FKxCR.png")
				embed.add_field(name="學號", value=student_id, inline=False)
				embed.add_field(name="班級", value=student["class"], inline=False)
				embed.add_field(name="姓名", value=student["name"], inline=False)
				await interaction.response.send_message(embed=embed, ephemeral=True)
				return
		await interaction.response.send_message("學號或姓名無效或未登記。", ephemeral=True)

async def send_signup_button(channel):
	button = Button(label="點擊驗證", style=discord.ButtonStyle.primary)

	async def button_callback(interaction):
		modal = signup()
		await interaction.response.send_modal(modal)

	button.callback = button_callback
	view = View(timeout=None)
	view.add_item(button)
	await channel.send("點擊下方按鈕進行驗證：", view=view)
#=======================================================